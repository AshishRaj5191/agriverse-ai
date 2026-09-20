import torch
from PIL import Image
from torchvision import transforms
from torchvision.models import resnet18

MODEL_PATH = "./models/checkpoints/model.pt"
IMAGE_PATH = "./data/PlantVillage/raw/color/Tomato___Early_blight/0012b9d2-2130-4a06-a834-b1f3af34f57e___RS_Erly.B 8389.JPG"

# Load checkpoint
checkpoint = torch.load(
    MODEL_PATH,
    map_location="cpu",
    weights_only=False,
)

classes = checkpoint["classes"]

# Create model
model = resnet18(weights=None)

model.fc = torch.nn.Linear(
    model.fc.in_features,
    len(classes),
)

model.load_state_dict(checkpoint["model_state_dict"])

model.eval()

# Same preprocessing used for validation
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

# Load image
image = Image.open(IMAGE_PATH).convert("RGB")

input_tensor = transform(image).unsqueeze(0)

# Prediction
with torch.no_grad():
    outputs = model(input_tensor)

    probabilities = torch.softmax(outputs, dim=1)

    confidence, predicted_index = torch.max(
        probabilities,
        dim=1,
    )

    top_probabilities, top_indices = torch.topk(
    probabilities[0],
        5,
    )

    print("\nTop 5 Predictions")
    print("-----------------")

    for rank, (probability, index) in enumerate(
        zip(top_probabilities, top_indices),
        start=1,
    ):
        print(
            f"{rank}. {classes[index.item()]} "
            f"- {probability.item() * 100:.2f}%"
        )

predicted_class = classes[predicted_index.item()]

print("\nPrediction Result")
print("-----------------")
print("Class:", predicted_class)
print("Confidence:", f"{confidence.item() * 100:.2f}%")