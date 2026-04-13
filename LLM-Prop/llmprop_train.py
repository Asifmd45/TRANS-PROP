"""
Set up the training code 
"""
import re
import glob
import time
import datetime
import os
from datetime import timedelta

import numpy as np
import pandas as pd

import torch
import torch.nn as nn
from torch.nn.utils.clip_grad import clip_grad_norm
from torch.nn.utils import clip_grad_norm_, clip_grad_value_
from torch.optim import SGD

import matplotlib.pyplot as plt

# add the progress bar
from tqdm import tqdm

from torch.optim import AdamW
from transformers import get_linear_schedule_with_warmup, get_cosine_schedule_with_warmup
from transformers import AutoTokenizer, T5EncoderModel, T5Tokenizer
from tokenizers.pre_tokenizers import Whitespace

pre_tokenizer = Whitespace()

# pre-defined functions
from llmprop_model import T5Predictor
from llmprop_utils import *
from llmprop_dataset import *
from llmprop_args_parser import *

# for metrics
from torchmetrics.classification import BinaryAUROC

# set the random seed for reproducibility
torch.manual_seed(42)
np.random.seed(42)

def print_preprocessing_preview(df, label="train"):
    if len(df) == 0:
        print(f"{label} data is empty after preprocessing")
        return
    print(df['description'].iloc[0])
    print('-'*50)
    preview_index = min(3, len(df) - 1)
    print(df['description'].iloc[preview_index])

def train(
    model, 
    optimizer, 
    scheduler, 
    scheduler_type,
    bce_loss_function, 
    mae_loss_function,
    epochs, 
    train_dataloader, 
    valid_dataloader, 
    device,  
    task_name,
    property_name,
    train_labels_mean,
    train_labels_std,
    train_labels_min,
    train_labels_max,
    normalizer="z_norm"
):
    
    training_starting_time = time.time()
    training_stats = []
    validation_predictions = {}
    
    best_loss = 1e10 # Set the best loss variable which record the best loss for each epoch
    best_roc = 0.0
    best_epoch = 0

    # Ensure output directories exist before writing checkpoints/statistics.
    os.makedirs(f"checkpoints/samples/{task_name}", exist_ok=True)
    os.makedirs(f"statistics/samples/{task_name}", exist_ok=True)

    for epoch in range(epochs):
        print(f"========== Epoch {epoch+1}/{epochs} =========")

        epoch_starting_time = time.time() 

        total_training_loss = 0
        total_training_mae_loss = 0
        total_training_normalized_mae_loss = 0

        model.train()

        for step, batch in tqdm(enumerate(train_dataloader), total=len(train_dataloader)):
            if step == 0 or (step + 1) % 200 == 0 or (step + 1) == len(train_dataloader):
                print(f"Step {step+1}/{len(train_dataloader)}")

            batch_inputs, batch_masks, batch_labels, batch_norm_labels = tuple(b.to(device) for b in batch)

            _, predictions = model(batch_inputs, batch_masks)

            if task_name == 'classification':
                loss = bce_loss_function(predictions.squeeze(), batch_labels.squeeze())
            
            elif task_name == 'regression':
                loss = mae_loss_function(predictions.squeeze(), batch_norm_labels.squeeze())
                
                if normalizer == 'z_norm':
                    predictions_denorm = z_denormalize(predictions, train_labels_mean, train_labels_std)

                elif normalizer == 'mm_norm':
                    predictions_denorm = mm_denormalize(predictions, train_labels_min, train_labels_max)

                elif normalizer == 'ls_norm':
                    predictions_denorm = ls_denormalize(predictions)

                elif normalizer == 'no_norm':
                    loss = mae_loss_function(predictions.squeeze(), batch_labels.squeeze())
                    predictions_denorm = predictions

                mae_loss = mae_loss_function(predictions_denorm.squeeze(), batch_labels.squeeze()) 

            # total training loss on actual output
            if task_name == "classification":
                total_training_loss += loss.item()
            
            elif task_name == "regression":
                total_training_loss += mae_loss.item()

            # back propagate
            loss.backward()
            
            optimizer.step()
            if scheduler_type in ['linear', 'onecycle', 'lambda']:
                scheduler.step()
            optimizer.zero_grad()

        if scheduler_type == 'step':
            scheduler.step()
        
        # average training loss on actual output
        average_training_loss = total_training_loss/len(train_dataloader) 
        
        epoch_ending_time = time.time()
        training_time = time_format(epoch_ending_time - epoch_starting_time)

        print(f"Average training loss = {average_training_loss}")
        print(f"Training for this epoch took {training_time}")

        # Validation
        print("")
        print("Running Validation ....")

        valid_start_time = time.time()

        model.eval()

        total_eval_mae_loss = 0
        predictions_list = []
        targets_list = []

        for step, batch in tqdm(enumerate(valid_dataloader), total=len(valid_dataloader)):
            batch_inputs, batch_masks, batch_labels = tuple(b.to(device) for b in batch)

            with torch.no_grad():
                _, predictions = model(batch_inputs, batch_masks)

                if task_name == "classification":
                    predictions_denorm = predictions

                elif task_name == "regression":
                    if normalizer == 'z_norm':
                        predictions_denorm = z_denormalize(predictions, train_labels_mean, train_labels_std)

                    elif normalizer == 'mm_norm':
                        predictions_denorm = mm_denormalize(predictions, train_labels_min, train_labels_max)

                    elif normalizer == 'ls_norm':
                        predictions_denorm = ls_denormalize(predictions)

                    elif normalizer == 'no_norm':
                        predictions_denorm = predictions

            predictions = predictions_denorm.detach().cpu().numpy()
            targets = batch_labels.detach().cpu().numpy()

            for i in range(len(predictions)):
                predictions_list.append(predictions[i][0])
                targets_list.append(targets[i])
        
        valid_ending_time = time.time()
        validation_time = time_format(valid_ending_time-valid_start_time)

        # save model checkpoint and the statistics of the epoch where the model performs the best
        if task_name == "classification":
            valid_performance = get_roc_score(predictions_list, targets_list)
            
            if valid_performance >= best_roc:
                best_roc = valid_performance
                best_epoch = epoch+1

                # save the best model checkpoint
                save_to_path = f"checkpoints/samples/{task_name}/best_checkpoint_for_{property_name}.pt"
                if isinstance(model, nn.DataParallel):
                    torch.save(model.module.state_dict(), save_to_path)
                    compressCheckpointsWithTar(save_to_path)
                else:
                    torch.save(model.state_dict(), save_to_path)
                    compressCheckpointsWithTar(save_to_path)
                
                # save statistics of the best model
                training_stats.append(
                    {
                        "best_epoch": epoch + 1,
                        "training_loss": average_training_loss,
                        "validation_roc_score": valid_performance,
                        "training time": training_time,
                        "validation time": validation_time
                    }
                )

                validation_predictions.update(
                    {
                        f"epoch_{epoch+1}": predictions_list
                    }
                )

                saveCSV(pd.DataFrame(data=training_stats), f"statistics/samples/{task_name}/training_stats_for_{property_name}.csv")
                saveCSV(pd.DataFrame(validation_predictions), f"statistics/samples/{task_name}/validation_stats_for_{property_name}.csv")

            else:
                best_roc = best_roc

            print(f"Validation roc score = {valid_performance}")

        elif task_name == "regression":
            predictions_tensor = torch.tensor(predictions_list)
            targets_tensor = torch.tensor(targets_list)
            valid_performance = mae_loss_function(predictions_tensor.squeeze(), targets_tensor.squeeze())
        
            if valid_performance <= best_loss:
                best_loss = valid_performance
                best_epoch = epoch+1

                # save the best model checkpoint
                save_to_path = f"checkpoints/samples/{task_name}/best_checkpoint_for_{property_name}.pt"
                if isinstance(model, nn.DataParallel):
                    torch.save(model.module.state_dict(), save_to_path)
                    compressCheckpointsWithTar(save_to_path)
                else:
                    torch.save(model.state_dict(), save_to_path)
                    compressCheckpointsWithTar(save_to_path)
                
                # save statistics of the best model
                training_stats.append(
                    {
                        "best_epoch": epoch + 1,
                        "training mae loss": average_training_loss,
                        "validation mae loss": valid_performance,
                        "training time": training_time,
                        "validation time": validation_time
                    }
                )

                validation_predictions.update(
                    {
                        f"epoch_{epoch+1}": predictions_list
                    }
                )

                saveCSV(pd.DataFrame(data=training_stats), f"statistics/samples/{task_name}/training_stats_for_{property_name}.csv")
                saveCSV(pd.DataFrame(validation_predictions), f"statistics/samples/{task_name}/validation_stats_for_{property_name}.csv")

            else:
                best_loss = best_loss
            
            print(f"Validation mae error = {valid_performance}")
        print(f"validation took {validation_time}")
    train_ending_time = time.time()
    total_training_time = train_ending_time-training_starting_time

    print("\n========== Training complete ========")
    print(f"Training LLM_Prop on {property_name} prediction took {time_format(total_training_time)}")

    if task_name == "classification":
        print(f"The lowest roc score achieved on validation set on {property_name} is {best_roc} at {best_epoch}th epoch \n")

    elif task_name == "regression":
        print(f"The lowest mae error achieved on validation set on predicting {property_name} is {best_loss} at {best_epoch}th epoch \n")
    
    return training_stats, validation_predictions

def evaluate(
    model, 
    mae_loss_function, 
    test_dataloader, 
    train_labels_mean, 
    train_labels_std,
    train_labels_min,
    train_labels_max, 
    property,
    device,
    task_name,
    normalizer="z_norm"
):
    test_start_time = time.time()

    model.eval()

    predictions_list = []
    targets_list = []

    os.makedirs(f"statistics/samples/{task_name}", exist_ok=True)

    for step, batch in enumerate(test_dataloader):
        batch_inputs, batch_masks, batch_labels = tuple(b.to(device) for b in batch)

        with torch.no_grad():
            _, predictions = model(batch_inputs, batch_masks)

            if task_name == "classification":
                predictions_denorm = predictions

            elif task_name == "regression":
                if normalizer == 'z_norm':
                    predictions_denorm = z_denormalize(predictions, train_labels_mean, train_labels_std)

                elif normalizer == 'mm_norm':
                    predictions_denorm = mm_denormalize(predictions, train_labels_min, train_labels_max)

                elif normalizer == 'ls_norm':
                    predictions_denorm = ls_denormalize(predictions)

                elif normalizer == 'no_norm':
                    predictions_denorm = predictions

        predictions = predictions_denorm.detach().cpu().numpy()
        targets = batch_labels.detach().cpu().numpy()

        for i in range(len(predictions)):
            predictions_list.append(predictions[i][0])
            targets_list.append(targets[i])
        
    test_predictions = {f"{property}": predictions_list}

    saveCSV(pd.DataFrame(test_predictions), f"statistics/samples/{task_name}/test_stats_for_{property}.csv")
        
    if task_name == "classification":
        test_performance = get_roc_score(predictions_list, targets_list)
        print(f"\n The roc score achieved on test set for predicting {property} is {test_performance}")

    elif task_name == "regression":
        predictions_tensor = torch.tensor(predictions_list)
        targets_tensor = torch.tensor(targets_list)
        test_performance = mae_loss_function(predictions_tensor.squeeze(), targets_tensor.squeeze())
        print(f"\n The mae error achieved on test set for predicting {property} is {test_performance}")

    test_ending_time = time.time()
    testing_time = time_format(test_ending_time-test_start_time)
    print(f"testing took {testing_time} \n")

    return predictions_list, test_performance

if __name__ == "__main__":
    # check if the GPU is available
    if torch.cuda.is_available():
        device = torch.device("cuda")
        print(f'Number of available devices: {torch.cuda.device_count()}')
        print(f'Current device is: {torch.cuda.current_device()}')
        print("Training and testing on", torch.cuda.device_count(), "GPUs!")
        print('-'*50)
    else:
        print("No GPU available, please connect to the GPU first or continue to use CPU instead")
        print('-'*50)
        device = torch.device("cpu")

    # parse Arguments
    args = args_parser()
    config = vars(args)

    # set parameters
    batch_size = config.get('bs')
    max_length = config.get('max_len')
    learning_rate = config.get('lr')
    drop_rate = config.get('dr')
    epochs = config.get('epochs')
    warmup_steps = config.get('warmup_steps')
    preprocessing_strategy = config.get('preprocessing_strategy')
    tokenizer_name = config.get('tokenizer')
    pooling = config.get('pooling')
    scheduler_type = config.get('scheduler')
    normalizer_type = config.get('normalizer')
    property = config.get('property_name')
    if property == 'epa':
        property = 'energy_per_atom'
        print("Mapping --property_name epa to energy_per_atom")
    optimizer_type = config.get('optimizer')
    task_name = config.get('task_name')
    train_data_path = config.get('train_data_path')
    valid_data_path = config.get('valid_data_path')
    test_data_path = config.get('test_data_path')

    # prepare the data
    train_data = pd.read_csv(train_data_path)
    train_data = pd.read_csv(train_data_path, nrows=20000)
    valid_data = pd.read_csv(valid_data_path)
    test_data = pd.read_csv(test_data_path)

    if 'is_gap_direct' in train_data.columns and 'is_gap_direct' in valid_data.columns and 'is_gap_direct' in test_data.columns:
        print("Train True/False split:", train_data['is_gap_direct'].value_counts().to_dict())
        print("Valid True/False split:", valid_data['is_gap_direct'].value_counts().to_dict())
        print("Test  True/False split:", test_data['is_gap_direct'].value_counts().to_dict())
    else:
        print("Skipping is_gap_direct split print because that column is not present in all datasets")

    # Drop rows with missing labels/description for the selected property.
    train_data = train_data.dropna(subset=['description', property]).reset_index(drop=True)
    valid_data = valid_data.dropna(subset=['description', property]).reset_index(drop=True)
    test_data = test_data.dropna(subset=['description', property]).reset_index(drop=True)

    # Infer task robustly: support bool/object/int binary labels, not only dtype==bool.
    unique_non_null_labels = set(str(v).strip().lower() for v in train_data[property].dropna().unique().tolist())
    binary_label_set = {'true', 'false', '0', '1', '0.0', '1.0'}
    if property == 'is_gap_direct' or unique_non_null_labels.issubset(binary_label_set):
        task_name = 'classification'

        def cast_binary_label(value):
            value_str = str(value).strip().lower()
            if value_str in ['true', '1', '1.0']:
                return 1.0
            if value_str in ['false', '0', '0.0']:
                return 0.0
            raise ValueError(f"Unsupported classification label '{value}' in column '{property}'")

        train_data[property] = train_data[property].apply(cast_binary_label)
        valid_data[property] = valid_data[property].apply(cast_binary_label)
        test_data[property] = test_data[property].apply(cast_binary_label)
    else:
        task_name = 'regression'
    
    train_labels_array = np.array(train_data[property])
    train_labels_mean = torch.mean(torch.tensor(train_labels_array))
    train_labels_std = torch.std(torch.tensor(train_labels_array))
    train_labels_min = torch.min(torch.tensor(train_labels_array))
    train_labels_max = torch.max(torch.tensor(train_labels_array))

    if preprocessing_strategy == "none":
        train_data = train_data
        valid_data = valid_data
        test_data = test_data

    elif preprocessing_strategy == "bond_lengths_replaced_with_num":
        train_data['description'] = train_data['description'].apply(replace_bond_lengths_with_num)
        valid_data['description'] = valid_data['description'].apply(replace_bond_lengths_with_num)
        test_data['description'] = test_data['description'].apply(replace_bond_lengths_with_num)
        print_preprocessing_preview(train_data, label="train")

    elif preprocessing_strategy == "bond_angles_replaced_with_ang":
        train_data['description'] = train_data['description'].apply(replace_bond_angles_with_ang)
        valid_data['description'] = valid_data['description'].apply(replace_bond_angles_with_ang)
        test_data['description'] = test_data['description'].apply(replace_bond_angles_with_ang) 
        print_preprocessing_preview(train_data, label="train")

    elif preprocessing_strategy == "no_stopwords":
        stopwords = get_cleaned_stopwords()
        train_data['description'] = train_data['description'].apply(remove_mat_stopwords)
        valid_data['description'] = valid_data['description'].apply(remove_mat_stopwords)
        test_data['description'] = test_data['description'].apply(remove_mat_stopwords)
        print_preprocessing_preview(train_data, label="train")

    elif preprocessing_strategy == "no_stopwords_and_lengths_and_angles_replaced":
        stopwords = get_cleaned_stopwords()
        train_data['description'] = train_data['description'].apply(replace_bond_lengths_with_num)
        train_data['description'] = train_data['description'].apply(replace_bond_angles_with_ang)
        train_data['description'] = train_data['description'].apply(remove_mat_stopwords) 
        valid_data['description'] = valid_data['description'].apply(replace_bond_lengths_with_num)
        valid_data['description'] = valid_data['description'].apply(replace_bond_angles_with_ang)
        valid_data['description'] = valid_data['description'].apply(remove_mat_stopwords)
        test_data['description'] = test_data['description'].apply(replace_bond_lengths_with_num)
        test_data['description'] = test_data['description'].apply(replace_bond_angles_with_ang)
        test_data['description'] = test_data['description'].apply(remove_mat_stopwords)
        print_preprocessing_preview(train_data, label="train")

    # define loss functions
    mae_loss_function = nn.L1Loss()
    bce_loss_function = nn.BCEWithLogitsLoss()

    freeze = False # a boolean variable to determine if we freeze the pre-trained T5 weights

    # define the tokenizer
    if tokenizer_name == 't5_tokenizer': 
        tokenizer = AutoTokenizer.from_pretrained("t5-small")

    elif tokenizer_name == 'modified':
        tokenizer_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tokenizers", "t5_tokenizer_trained_on_modified_part_of_C4_and_textedge")
        tokenizer = AutoTokenizer.from_pretrained(tokenizer_dir)

    # add defined special tokens to the tokenizer
    if pooling == 'cls':
        tokenizer.add_tokens(["[CLS]"])

    if preprocessing_strategy == "bond_lengths_replaced_with_num":
        tokenizer.add_tokens(["[NUM]"]) # special token to replace bond lengths
    
    elif preprocessing_strategy == "bond_angles_replaced_with_ang":
        tokenizer.add_tokens(["[ANG]"]) # special token to replace bond angles

    elif preprocessing_strategy == "no_stopwords_and_lengths_and_angles_replaced":
        tokenizer.add_tokens(["[NUM]"])
        tokenizer.add_tokens(["[ANG]"]) 
    
    print('-'*50)
    print(f"train data = {len(train_data)} samples")
    print(f"valid data = {len(valid_data)} samples")
    print('-'*50)
    print(f"training on {get_sequence_len_stats(train_data, tokenizer, max_length)}% samples with whole sequence")
    print(f"validating on {get_sequence_len_stats(valid_data, tokenizer, max_length)}% samples with whole sequence")
    print('-'*50)

    print("labels statistics on training set:")
    print("Mean:", train_labels_mean)
    print("Standard deviation:", train_labels_std)
    print("Max:", train_labels_max)
    print("Min:", train_labels_min)
    print("-"*50)

    # define the model
    base_model = T5EncoderModel.from_pretrained("google/t5-v1_1-small")
    base_model_output_size = 512

    # freeze the pre-trained LM's parameters
    if freeze:
        for param in base_model.parameters():
            param.requires_grad = False

    # resizing the model input embeddings matrix to adapt to newly added tokens by the new tokenizer
    # this is to avoid the "RuntimeError: CUDA error: device-side assert triggered" error
    base_model.resize_token_embeddings(len(tokenizer))

# instantiate the model
model = T5Predictor(base_model, base_model_output_size, drop_rate=drop_rate, pooling=pooling)

device_ids = [d for d in range(torch.cuda.device_count())]

if torch.cuda.device_count() > 1:
    model = nn.DataParallel(model, device_ids=device_ids).cuda()
else:
    model.to(device)

# ✅ Load checkpoint AFTER moving to device
checkpoint_path = config.get('checkpoint')

if task_name == 'regression' and checkpoint_path and ('classification' in checkpoint_path or 'is_gap_direct' in checkpoint_path):
    print(f"Ignoring classification checkpoint for regression run: {checkpoint_path}")
    checkpoint_path = ''

if checkpoint_path and os.path.exists(checkpoint_path):
    print(f"Resuming from checkpoint: {checkpoint_path}")
    state_dict = torch.load(checkpoint_path, map_location=device)

    if isinstance(model, nn.DataParallel):
        model.module.load_state_dict(state_dict, strict=False)
    else:
        model.load_state_dict(state_dict, strict=False)

    print("✅ Checkpoint loaded successfully!")
else:
    print("🔄 Starting fresh training...")

# ✅ ALWAYS RUN BELOW (IMPORTANT)

# print model parameters
model_trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
print(f"Total parameters = {model_trainable_params}")

# create dataloaders
train_dataloader = create_dataloaders(
    tokenizer, train_data, max_length, batch_size,
    property_value=property,
    pooling=pooling,
    normalize=True,
    normalizer=normalizer_type,
    labels_mean=train_labels_mean,
    labels_std=train_labels_std,
    labels_min=train_labels_min,
    labels_max=train_labels_max
)
valid_dataloader = create_dataloaders(
    tokenizer, valid_data, max_length, batch_size,
    property_value=property, pooling=pooling
)

test_dataloader = create_dataloaders(
    tokenizer, test_data, max_length, batch_size,
    property_value=property, pooling=pooling
)

# optimizer
if optimizer_type == 'adamw':
    optimizer = AdamW(model.parameters(), lr=learning_rate)
elif optimizer_type == 'sgd':
    optimizer = SGD(model.parameters(), lr=learning_rate)
else:
    raise ValueError("Unsupported optimizer")

# scheduler
total_training_steps = len(train_dataloader) * epochs

if scheduler_type == 'linear':
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=warmup_steps,
        num_training_steps=total_training_steps
    )
elif scheduler_type == 'onecycle':
    scheduler = torch.optim.lr_scheduler.OneCycleLR(
        optimizer,
        max_lr=learning_rate,
        epochs=epochs,
        steps_per_epoch=len(train_dataloader),
        pct_start=0.3,
    )
elif scheduler_type == 'step':
    scheduler = torch.optim.lr_scheduler.StepLR(
        optimizer,
        step_size=warmup_steps
    )
elif scheduler_type == 'lambda':
    scheduler = torch.optim.lr_scheduler.LambdaLR(
        optimizer, lambda epoch: 1.0
    )
else:
    raise ValueError("Unsupported scheduler")

# 🚀 TRAIN ALWAYS
print("======= Training ... ========")

training_stats, validation_predictions = train(
    model,
    optimizer,
    scheduler,
    scheduler_type,
    bce_loss_function,
    mae_loss_function,
    epochs,
    train_dataloader,
    valid_dataloader,
    device,
    task_name,
    property,
    train_labels_mean,
    train_labels_std,
    train_labels_min,
    train_labels_max,
    normalizer=normalizer_type
)

print("======= Evaluating on test set ========")

best_model_path = f"checkpoints/samples/{task_name}/best_checkpoint_for_{property}.pt"

best_model = T5Predictor(base_model, base_model_output_size, drop_rate=drop_rate, pooling=pooling)

if torch.cuda.is_available():
    best_model = nn.DataParallel(best_model, device_ids=device_ids).cuda()

if isinstance(best_model, nn.DataParallel):
    best_model.module.load_state_dict(torch.load(best_model_path, map_location=device), strict=False)
else:
    best_model.load_state_dict(torch.load(best_model_path, map_location=device), strict=False)
    best_model.to(device)

_, test_performance = evaluate(
    best_model,
    mae_loss_function,
    test_dataloader,
    train_labels_mean,
    train_labels_std,
    train_labels_min,
    train_labels_max,
    property,
    device,
    task_name,
    normalizer=normalizer_type
)