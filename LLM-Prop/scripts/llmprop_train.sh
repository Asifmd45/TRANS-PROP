#!/usr/bin/env bash

TRAIN_PATH="data/samples/train_data.csv"
VALID_PATH="data/samples/validation_data.csv"
TEST_PATH="data/samples/test_data.csv"
EPOCHS=2 # the default epochs is 200 to get the best performance
PROPERTY="is_gap_direct" # specify the property name

python llmprop_train.py \
--train_data_path $TRAIN_PATH \
--valid_data_path $VALID_PATH \
--test_data_path $TEST_PATH \
--epochs $EPOCHS \
--property_name $PROPERTY