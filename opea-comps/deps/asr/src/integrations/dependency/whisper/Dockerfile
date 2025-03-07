# Copyright (C) 2024 Intel Corporation
# SPDX-License-Identifier: Apache-2.0

FROM python:3.11-slim

RUN useradd -m -s /bin/bash user && \
    mkdir -p /home/user && \
    chown -R user /home/user/

# Set environment variables
ENV LANG=en_US.UTF-8
ARG ARCH=cpu

# Install system dependencies
RUN apt-get update \
    && apt-get install -y ffmpeg curl

COPY --chown=user:user opea-comps/deps /home/user/comps

RUN pip install --upgrade pip setuptools && \
    pip install --retries 5 --timeout 120 -r /home/user/comps/asr/src/requirements.txt && \
    if [ "${ARCH}" = "cpu" ]; then \
        pip install --retries 5 --timeout 120 torch torchvision --index-url https://download.pytorch.org/whl/cpu ; \
        pip install --retries 5 --timeout 120 --extra-index-url https://download.pytorch.org/whl/cpu -r /home/user/comps/asr/src/requirements.txt ; \
    else \
        pip install --retries 5 --timeout 120 -r /home/user/comps/asr/src/requirements.txt ; \
    fi

ENV PYTHONPATH=$PYTHONPATH:/home/user
USER user
WORKDIR /home/user/comps/asr/src/integrations/dependency/whisper

ENTRYPOINT ["python", "whisper_server.py", "--device", "cpu"]
