#!/usr/bin/env bash

TRAIN_PATH="data/samples/train_data.csv" # few examples just for testing purposes only, not intended to reproduce the results
TEST_PATH="data/samples/test_data.csv" # few examples just for testing purposes only, not intended to reproduce the results
TASK_NAME="classification" # the task name can also be set to "regression"
PROPERTY="is_gap_direct" # the property can also be set to "band_gap" or "volume".
CKPT_PATH="checkpoints/samples/$TASK_NAME/best_checkpoint_for_$PROPERTY.tar.gz" # path to the best model 

python llmprop_evaluate.py \
--train_data_path $TRAIN_PATH \
--test_data_path $TEST_PATH \
--task_name $TASK_NAME \
--property_name $PROPERTY \
--checkpoint $CKPT_PATH