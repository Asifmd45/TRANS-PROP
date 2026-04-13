import torch
import os
import sys
import argparse
from transformers import AutoTokenizer, T5EncoderModel

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

# -------------------------
# CONFIG
# -------------------------
MODEL_PATH = os.path.join(PROJECT_DIR, "checkpoints", "samples", "classification", "best_checkpoint_for_is_gap_direct.pt")

TOKENIZER_PATH = os.path.join(PROJECT_DIR, "tokenizers", "t5_tokenizer_trained_on_modified_part_of_C4_and_textedge")

DEVICE = torch.device("cpu")

# -------------------------
# LOAD TOKENIZER
# -------------------------
tokenizer = AutoTokenizer.from_pretrained(TOKENIZER_PATH)

# -------------------------
# LOAD MODEL
# -------------------------
base_model = T5EncoderModel.from_pretrained("google/t5-v1_1-small")
base_model_output_size = 512

# Match embedding matrix size to the tokenizer used during training.
base_model.resize_token_embeddings(len(tokenizer), mean_resizing=False)

model = T5Predictor(
    base_model,
    base_model_output_size,
    drop_rate=0.1,
    pooling="mean"   # ✅ confirmed from your command
)

# -------------------------
# LOAD WEIGHTS
# -------------------------
state_dict = torch.load(MODEL_PATH, map_location=DEVICE)

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
def predict(text, threshold=0.33):

    # ❌ NO preprocessing (important)
    
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=256   # ✅ from your command
    )

    input_ids = inputs["input_ids"].to(DEVICE)
    attention_mask = inputs["attention_mask"].to(DEVICE)

    with torch.no_grad():
        _, predictions = model(input_ids, attention_mask)

        prob = torch.sigmoid(predictions).item()

        if prob > threshold:
            return "TRUE", prob
        else:
            return "FALSE", prob


# -------------------------
# TEST
# -------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Predict is_gap_direct from text")
    parser.add_argument("--threshold", type=float, default=0.33, help="Decision threshold for TRUE/FALSE")
    parser.add_argument("--text", type=str, default="Rb₂NaPrCl₆ is (Cubic) Perovskite-derived structured and crystallizes in the cubic Fm̅3m space group. Rb¹⁺ is bonded to twelve equivalent Cl¹⁻ atoms to form RbCl₁₂ cuboctahedra that share corners with twelve equivalent RbCl₁₂ cuboctahedra, faces with six equivalent RbCl₁₂ cuboctahedra, faces with four equivalent NaCl₆ octahedra, and faces with four equivalent PrCl₆ octahedra. All Rb–Cl bond lengths are 3.90 Å. Na¹⁺ is bonded to six equivalent Cl¹⁻ atoms to form NaCl₆ octahedra that share corners with six equivalent PrCl₆ octahedra and faces with eight equivalent RbCl₁₂ cuboctahedra. The corner-sharing octahedra are not tilted. All Na–Cl bond lengths are 2.76 Å. Pr³⁺ is bonded to six equivalent Cl¹⁻ atoms to form PrCl₆ octahedra that share corners with six equivalent NaCl₆ octahedra and faces with eight equivalent RbCl₁₂ cuboctahedra. The corner-sharing octahedra are not tilted. All Pr–Cl bond lengths are 2.75 Å. Cl¹⁻ is bonded in a distorted linear geometry to four equivalent Rb¹⁺, one Na¹⁺, and one Pr³⁺ atom.", help="Input text to classify")
    args = parser.parse_args()
    result, prob = predict(args.text, threshold=args.threshold)
    print(result, prob)