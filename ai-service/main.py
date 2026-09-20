import os
from pathlib import Path

import torch
from PIL import Image
from fastapi import FastAPI, File, UploadFile
from torchvision import transforms
from torchvision.models import resnet18

from dotenv import load_dotenv


load_dotenv()


# --------------------------------------------------
# Paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "checkpoints"
    / "model.pt"
)


# --------------------------------------------------
# FastAPI
# --------------------------------------------------

app = FastAPI(
    title="AgriVerse AI Service",
    description="AI service for agricultural disease detection",
    version="1.0.0",
)


# --------------------------------------------------
# Device
# --------------------------------------------------

DEVICE = torch.device("cpu")


# --------------------------------------------------
# Load trained model
# --------------------------------------------------

checkpoint = torch.load(
    MODEL_PATH,
    map_location=DEVICE,
    weights_only=False,
)

CLASSES = checkpoint["classes"]

model = resnet18(weights=None)

model.fc = torch.nn.Linear(
    model.fc.in_features,
    len(CLASSES),
)

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model.to(DEVICE)
model.eval()


# --------------------------------------------------
# Image preprocessing
# --------------------------------------------------

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])


# --------------------------------------------------
# Routes
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "service": "AgriVerse AI Service",
        "status": "running",
        "model": "ResNet18",
        "classes": len(CLASSES),
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "ai-service",
        "model_loaded": True,
        "classes": len(CLASSES),
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    image_bytes = await file.read()

    image = Image.open(
        __import__("io").BytesIO(image_bytes)
    ).convert("RGB")

    input_tensor = transform(
        image
    ).unsqueeze(0).to(DEVICE)

    with torch.no_grad():

        outputs = model(
            input_tensor
        )

        probabilities = torch.softmax(
            outputs,
            dim=1,
        )

        top_probabilities, top_indices = torch.topk(
            probabilities[0],
            3,
        )

    predictions = []

    for probability, index in zip(
        top_probabilities,
        top_indices,
    ):
        predictions.append({
            "class": CLASSES[index.item()],
            "confidence": round(
                probability.item() * 100,
                2,
            ),
        })

    return {
        "filename": file.filename,
        "top_prediction": predictions[0],
        "top_predictions": predictions,
    }