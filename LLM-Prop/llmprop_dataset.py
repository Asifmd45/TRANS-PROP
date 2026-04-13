"""
A function to prepare the dataloaders
"""
# Import packages
import glob
import torch
import pandas as pd
import numpy as np
from torch.utils.data import DataLoader, TensorDataset
from llmprop_utils import *

np.random.seed(42)

def tokenize(tokenizer, dataframe, max_length, pooling='cls'):
    input_ids = []
    attention_masks = []

    for descr in dataframe.description.tolist():
        if pooling == 'cls':
            text = "[CLS] " + str(descr)
        else:
            text = str(descr)

        encoding = tokenizer(
            text,
            add_special_tokens=True,
            padding='max_length',
            truncation=True,
            max_length=max_length,
            return_attention_mask=True
        )

        input_ids.append(encoding['input_ids'])
        attention_masks.append(encoding['attention_mask'])

    return input_ids, attention_masks

def create_dataloaders(
    tokenizer,
    dataframe,
    max_length,
    batch_size,
    property_value="band_gap",
    pooling='cls',
    normalize=False,
    normalizer='z_norm',
    shuffle=None,
    # ✅ NEW: pass global stats
    labels_mean=None,
    labels_std=None,
    labels_min=None,
    labels_max=None,
):
    input_ids, attention_masks = tokenize(tokenizer, dataframe, max_length, pooling=pooling)
    labels = dataframe[property_value].to_numpy()

    input_tensor = torch.tensor(input_ids, dtype=torch.long)
    mask_tensor = torch.tensor(attention_masks, dtype=torch.long)
    labels_tensor = torch.tensor(labels, dtype=torch.float32)

    if normalize:
        if normalizer == 'z_norm':
            # ✅ FIX: use SAME stats as training loop
            if labels_mean is not None and labels_std is not None:
                mean = labels_mean
                std = labels_std
                normalized_labels = (labels_tensor - mean) / (std + 1e-8)
            else:
                print("[WARNING] No global mean/std passed — fallback to local normalization")
                normalized_labels = z_normalizer(labels_tensor)

        elif normalizer == 'mm_norm':
            if labels_min is not None and labels_max is not None:
                lo = labels_min
                hi = labels_max
                normalized_labels = (labels_tensor - lo) / (hi - lo + 1e-8)
            else:
                normalized_labels = min_max_scaling(labels_tensor)

        elif normalizer == 'ls_norm':
            normalized_labels = log_scaling(labels_tensor)

        elif normalizer == 'no_norm':
            normalized_labels = labels_tensor

        dataset = TensorDataset(input_tensor, mask_tensor, labels_tensor, normalized_labels)

    else:
        dataset = TensorDataset(input_tensor, mask_tensor, labels_tensor)

    if shuffle is None:
        shuffle = normalize

    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=shuffle)

    return dataloader    #Dataloader which arrange the input sequences, attention masks, and labels in batchesand transform the to tensors
    input_ids, attention_masks = tokenize(tokenizer, dataframe, max_length, pooling=pooling)
    labels = dataframe[property_value].to_numpy()

    input_tensor = torch.tensor(input_ids, dtype=torch.long)
    mask_tensor = torch.tensor(attention_masks, dtype=torch.long)
    labels_tensor = torch.tensor(labels, dtype=torch.float32)

    if normalize:
        if normalizer == 'z_norm':
            normalized_labels = z_normalizer(labels_tensor)
        elif normalizer == 'mm_norm':
           normalized_labels = min_max_scaling(labels_tensor)
        elif normalizer == 'ls_norm':
            normalized_labels = log_scaling(labels_tensor)
        elif normalizer == 'no_norm':
            normalized_labels = labels_tensor

        dataset = TensorDataset(input_tensor, mask_tensor, labels_tensor, normalized_labels)
    else:
        dataset = TensorDataset(input_tensor, mask_tensor, labels_tensor)

    if shuffle is None:
        # Default behavior: shuffle training data (normalize=True), keep eval deterministic.
        shuffle = normalize
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=shuffle)

    return dataloader
