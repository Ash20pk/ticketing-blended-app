.DEFAULT_GOAL := all

# Compilation flags
RUSTFLAGS := '-C link-arg=-zstack-size=131072 -C target-feature=+bulk-memory -C opt-level=z -C strip=symbols'

# Paths to the target WASM file and output directory
WASM_TARGET := ./target/wasm32-unknown-unknown/release/ticketing.wasm
WASM_OUTPUT_DIR := bin
WASM_OUTPUT_FILE := $(WASM_OUTPUT_DIR)/ticketing.wasm

# Commands
CARGO_BUILD := cargo build --release --target=wasm32-unknown-unknown --no-default-features
RM := rm -rf
MKDIR := mkdir -p
CP := cp

# Targets
all: build

build: prepare_output_dir
	@echo "Building the project..."
	RUSTFLAGS=$(RUSTFLAGS) $(CARGO_BUILD)

	@echo "Copying the wasm file to the output directory..."
	$(CP) $(WASM_TARGET) $(WASM_OUTPUT_FILE)

prepare_output_dir:
	@echo "Preparing the output directory..."
	$(RM) $(WASM_OUTPUT_DIR)
	$(MKDIR) $(WASM_OUTPUT_DIR)


.PHONY: all build prepare_output_dir 