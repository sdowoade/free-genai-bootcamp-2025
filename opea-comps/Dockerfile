# Copyright (C) 2024 Intel Corporation
# SPDX-License-Identifier: Apache-2.0

# Stage 1: base setup used by other stages
FROM python:3.11-slim AS base

# get security updates
RUN apt-get update && apt-get upgrade -y && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

ENV HOME=/home/user

RUN useradd -m -s /bin/bash user && \
    mkdir -p $HOME && \
    chown -R user $HOME

WORKDIR $HOME


# Stage 2: latest GenAIComps sources
FROM base AS git

RUN apt-get update && apt-get install -y --no-install-recommends git
RUN git clone --depth 1 https://github.com/opea-project/GenAIComps.git


# Stage 3: common layer shared by services using GenAIComps
FROM base AS comps-base

# copy just relevant parts
COPY --from=git $HOME/GenAIComps/comps $HOME/GenAIComps/comps
COPY --from=git $HOME/GenAIComps/*.* $HOME/GenAIComps/LICENSE $HOME/GenAIComps/

WORKDIR $HOME/GenAIComps
RUN pip install --no-cache-dir --upgrade pip setuptools && \
    pip install --no-cache-dir -r $HOME/GenAIComps/requirements.txt
WORKDIR $HOME

ENV PYTHONPATH=$PYTHONPATH:$HOME/GenAIComps

USER user


# Stage 4: unique part
FROM comps-base

COPY ./chat.py $HOME/chat.py

ENTRYPOINT ["python", "chat.py"]