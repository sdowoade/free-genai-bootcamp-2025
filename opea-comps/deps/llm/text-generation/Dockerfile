# Copyright (C) 2024 Intel Corporation
# SPDX-License-Identifier: Apache-2.0

FROM python:3.11-slim

RUN apt-get update -y && apt-get install -y --no-install-recommends --fix-missing \
    libgl1-mesa-glx \
    libjemalloc-dev

RUN useradd -m -s /bin/bash user && \
    mkdir -p /home/user && \
    chown -R user /home/user/

COPY opea-comps/deps /home/user/comps

RUN pip install --retries 5 --timeout 120 --upgrade pip setuptools && \
    pip install --retries 5 --timeout 120 -r /home/user/comps/llm/text-generation/requirements.txt

ENV PYTHONPATH=$PYTHONPATH:/home/user

USER user

WORKDIR /home/user/comps/llms/text-generation

ENTRYPOINT ["bash", "entrypoint.sh"]
