import argparse
import os
import sys
import logging
import io
import contextlib

import pandas as pd
import torch
from transformers import AutoTokenizer, T5EncoderModel
from transformers.utils import logging as transformers_logging

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_CANDIDATES = [
    SCRIPT_DIR,
    os.path.dirname(SCRIPT_DIR),
    os.path.join(os.path.dirname(SCRIPT_DIR), "LLM-Prop"),
]

PROJECT_DIR = None
for candidate in PROJECT_CANDIDATES:
    if os.path.exists(os.path.join(candidate, "llmprop_model.py")):
        PROJECT_DIR = candidate
        break

if PROJECT_DIR is None:
    raise FileNotFoundError(
        "Could not locate project root containing llmprop_model.py. "
        "Expected near the deployment folder."
    )

if os.path.isdir(PROJECT_DIR) and PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

from llmprop_model import T5Predictor


def z_denormalize(scaled_labels, labels_mean, labels_std):
    return (scaled_labels * labels_std) + labels_mean

# -------------------------
# CONFIG
# -------------------------
MODEL_PATH = os.path.join(
    PROJECT_DIR,
    "checkpoints",
    "samples",
    "regression",
    "best_checkpoint_for_energy_per_atom.pt",
)
TOKENIZER_PATH = os.path.join(
    PROJECT_DIR,
    "tokenizers",
    "t5_tokenizer_trained_on_modified_part_of_C4_and_textedge",
)
TRAIN_DATA_PATH = os.path.join(PROJECT_DIR, "data", "samples", "train_data.csv")
PROPERTY_NAME = "energy_per_atom"
DEVICE = torch.device("cpu")

# Silence HF/Transformers startup logs for cleaner terminal output.
os.environ.setdefault("HF_HUB_DISABLE_PROGRESS_BARS", "1")
os.environ.setdefault("TRANSFORMERS_VERBOSITY", "error")
transformers_logging.set_verbosity_error()
logging.getLogger("huggingface_hub").setLevel(logging.ERROR)


# -------------------------
# PATH CHECKS
# -------------------------
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Checkpoint not found: {MODEL_PATH}")
if not os.path.exists(TOKENIZER_PATH):
    raise FileNotFoundError(f"Tokenizer path not found: {TOKENIZER_PATH}")
if not os.path.exists(TRAIN_DATA_PATH):
    raise FileNotFoundError(f"Training data not found: {TRAIN_DATA_PATH}")


# -------------------------
# LOAD TRAIN LABEL STATS (z_norm)
# -------------------------
train_df = pd.read_csv(TRAIN_DATA_PATH)
if PROPERTY_NAME not in train_df.columns:
    raise ValueError(f"Column '{PROPERTY_NAME}' not found in {TRAIN_DATA_PATH}")

train_labels = torch.tensor(
    train_df[PROPERTY_NAME].dropna().to_numpy(),
    dtype=torch.float32,
)
if train_labels.numel() == 0:
    raise ValueError(f"No non-null values found for '{PROPERTY_NAME}' in {TRAIN_DATA_PATH}")

TRAIN_LABEL_MEAN = torch.mean(train_labels)
TRAIN_LABEL_STD = torch.std(train_labels)
if float(TRAIN_LABEL_STD) == 0.0:
    raise ValueError(
        f"Standard deviation for '{PROPERTY_NAME}' is 0.0; z_norm de-normalization is undefined"
    )


def _quiet_call(fn, *args, **kwargs):
    with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
        return fn(*args, **kwargs)


# -------------------------
# LOAD TOKENIZER
# -------------------------
tokenizer = _quiet_call(AutoTokenizer.from_pretrained, TOKENIZER_PATH)


# -------------------------
# LOAD MODEL
# -------------------------
base_model = _quiet_call(T5EncoderModel.from_pretrained, "google/t5-v1_1-small")
base_model_output_size = 512

# Match embedding matrix size to the tokenizer used during training.
base_model.resize_token_embeddings(len(tokenizer), mean_resizing=False)

model = T5Predictor(
    base_model,
    base_model_output_size,
    drop_rate=0.1,
    pooling="mean",
)


# -------------------------
# LOAD WEIGHTS
# -------------------------
state_dict = _quiet_call(torch.load, MODEL_PATH, map_location=DEVICE)

# Some checkpoints were trained with an extra tokenizer token; align embedding size to checkpoint.
checkpoint_vocab_size = state_dict["model.shared.weight"].shape[0]
if model.model.shared.weight.shape[0] != checkpoint_vocab_size:
    model.model.resize_token_embeddings(checkpoint_vocab_size, mean_resizing=False)

model.load_state_dict(state_dict, strict=False)
model.to(DEVICE)
model.eval()


# -------------------------
# PREDICT FUNCTION
# -------------------------
def predict_epa(text, max_length=256):
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=max_length,
    )

    input_ids = inputs["input_ids"].to(DEVICE)
    attention_mask = inputs["attention_mask"].to(DEVICE)

    with torch.no_grad():
        _, prediction_norm = model(input_ids, attention_mask)
        prediction_epa = z_denormalize(
            prediction_norm.squeeze(),
            TRAIN_LABEL_MEAN,
            TRAIN_LABEL_STD,
        ).item()

    return prediction_epa


# -------------------------
# TEST
# -------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Predict energy_per_atom from text")
    parser.add_argument("--max_length", type=int, default=256, help="Tokenizer max length")
    parser.add_argument(
        "--text",
        type=str,
        default="A simple cubic crystalLiAl(MoO₄)₂ crystallizes in the triclinic P̅1 space group. Li¹⁺ is bonded in a 5-coordinate geometry to five O²⁻ atoms. There are a spread of Li–O bond distances ranging from 1.98–2.25 Å. There are two inequivalent Mo⁶⁺ sites. In the first Mo⁶⁺ site, Mo⁶⁺ is bonded in a 4-coordinate geometry to five O²⁻ atoms. There are a spread of Mo–O bond distances ranging from 1.74–2.46 Å. In the second Mo⁶⁺ site, Mo⁶⁺ is bonded to four O²⁻ atoms to form MoO₄ tetrahedra that share corners with three equivalent AlO₆ octahedra. The corner-sharing octahedral tilt angles range from 15–44°. There are a spread of Mo–O bond distances ranging from 1.77–1.82 Å. Al³⁺ is bonded to six O²⁻ atoms to form AlO₆ octahedra that share corners with three equivalent MoO₄ tetrahedra and  an edgeedge with one AlO₆ octahedra. There are a spread of Al–O bond distances ranging from 1.88–1.95 Å. There are eight inequivalent O²⁻ sites. In the first O²⁻ site, O²⁻ is bonded in a distorted trigonal planar geometry to one Li¹⁺, one Mo⁶⁺, and one Al³⁺ atom. In the second O²⁻ site, O²⁻ is bonded in a distorted trigonal planar geometry to one Mo⁶⁺ and two equivalent Al³⁺ atoms. In the third O²⁻ site, O²⁻ is bonded in a bent 150 degrees geometry to one Li¹⁺ and one Mo⁶⁺ atom. In the fourth O²⁻ site, O²⁻ is bonded in a linear geometry to one Li¹⁺ and one Mo⁶⁺ atom. In the fifth O²⁻ site, O²⁻ is bonded in a linear geometry to one Mo⁶⁺ and one Al³⁺ atom. In the sixth O²⁻ site, O²⁻ is bonded in a bent 150 degrees geometry to one Li¹⁺ and one Mo⁶⁺ atom. In the seventh O²⁻ site, O²⁻ is bonded in a 4-coordinate geometry to one Li¹⁺, two equivalent Mo⁶⁺, and one Al³⁺ atom. In the eighth O²⁻ site, O²⁻ is bonded in a bent 150 degrees geometry to one Mo⁶⁺ and one Al³⁺ atom. with atoms arranged periodically and stable at room temperature.",
        help="Input text to predict EPA",
    )
    args = parser.parse_args()

    value = predict_epa(args.text, max_length=args.max_length)
    print(f"Predicted energy_per_atom: {value:.6f}")
