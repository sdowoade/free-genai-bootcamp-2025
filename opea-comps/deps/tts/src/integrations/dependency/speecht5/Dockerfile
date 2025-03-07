# Copyright (C) 2024 Intel Corporation
# SPDX-License-Identifier: Apache-2.0

FROM python:3.11-slim
RUN useradd -m -s /bin/bash user && \
    mkdir -p /home/user && \
    chown -R user /home/user/

# Set environment variables
ENV LANG=en_US.UTF-8
ENV PYTHONPATH=/home/user
ARG ARCH=cpu

# Install system dependencies
RUN apt-get update \
    && apt-get install -y ffmpeg \
    && apt-get install -y curl

COPY --chown=user:user opea-comps/deps /home/user/comps

RUN pip install --retries 5 --timeout 120 --upgrade pip setuptools && \
    if [ "${ARCH}" = "cpu" ]; then \
        pip install --retries 5 --timeout 120 torch torchvision --index-url https://download.pytorch.org/whl/cpu ; \
        pip install --retries 5 --timeout 120 --extra-index-url https://download.pytorch.org/whl/cpu -r /home/user/comps/tts/src/integrations/dependency/speecht5/requirements.txt ; \
    else \
        pip install --retries 5 --timeout 120 -r /home/user/comps/tts/src/integrations/dependency/speecht5/requirements.txt ; \
    fi

ENV PYTHONPATH=$PYTHONPATH:/home/user

USER user

WORKDIR /home/user/comps/tts/src/integrations/dependency/speecht5

ENTRYPOINT ["python", "speecht5_server.py", "--device", "cpu"]
