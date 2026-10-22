from pathlib import Path

# Project paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data" / "PlantVillage" / "raw" / "color"
MODEL_DIR = BASE_DIR / "models"
CHECKPOINT_DIR = MODEL_DIR / "checkpoints"

# Create checkpoint directory if it does not exist
CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)


def get_classes():
    """Return all disease/healthy classes from dataset folders."""
    classes = sorted(
        folder.name
        for folder in DATA_DIR.iterdir()
        if folder.is_dir()
    )
    return classes


if __name__ == "__main__":
    classes = get_classes()

    print(f"Dataset path: {DATA_DIR}")
    print(f"Number of classes: {len(classes)}")
    print("\nClasses:")

    for index, class_name in enumerate(classes):
        print(f"{index:02d} -> {class_name}")




# PyTorch Dataset + train/validation split
import torch
from torchvision import datasets, transforms
from torch.utils.data import random_split
from torch.utils.data import DataLoader, WeightedRandomSampler
from torchvision.models import resnet18, ResNet18_Weights


# Training image preprocessing and augmentation
train_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(
        brightness=0.2,
        contrast=0.2,
        saturation=0.2,
    ),
    transforms.ToTensor(),
])


# Validation image preprocessing
val_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])


def create_datasets():
    """Create separate training and validation datasets with different transforms."""

    # First create a dataset only to get image paths and labels
    base_dataset = datasets.ImageFolder(
        root=DATA_DIR,
    )

    validation_size = int(0.2 * len(base_dataset))
    train_size = len(base_dataset) - validation_size

    generator = torch.Generator().manual_seed(42)

    train_indices, validation_indices = random_split(
        range(len(base_dataset)),
        [train_size, validation_size],
        generator=generator,
    )

    # Create separate datasets so each gets its own transform
    train_full_dataset = datasets.ImageFolder(
        root=DATA_DIR,
        transform=train_transform,
    )

    validation_full_dataset = datasets.ImageFolder(
        root=DATA_DIR,
        transform=val_transform,
    )

    train_dataset = torch.utils.data.Subset(
        train_full_dataset,
        train_indices.indices,
    )

    validation_dataset = torch.utils.data.Subset(
        validation_full_dataset,
        validation_indices.indices,
    )

    return base_dataset, train_dataset, validation_dataset


def create_weighted_sampler(train_dataset):
    """Create a class-balanced sampler for the training dataset."""
    targets = torch.tensor(
        [
            train_dataset.dataset.targets[index]
            for index in train_dataset.indices
        ],
        dtype=torch.long,
    )

    class_counts = torch.bincount(
        targets,
        minlength=len(get_classes()),
    )

    class_weights = 1.0 / class_counts.float()
    sample_weights = class_weights[targets]

    sampler = WeightedRandomSampler(
        weights=sample_weights,
        num_samples=len(sample_weights),
        replacement=True,
    )

    return sampler


def create_model(num_classes):
    """Create a pretrained ResNet18 model for plant disease classification."""
    weights = ResNet18_Weights.DEFAULT

    model = resnet18(weights=weights)

    # Replace the original ImageNet classifier
    # with a classifier for our 38 PlantVillage classes.
    model.fc = torch.nn.Linear(
        model.fc.in_features,
        num_classes,
    )

    return model

def setup_training(model):
    """Configure device, loss function, and optimizer."""

    device = torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"
    )

    model = model.to(device)

    criterion = torch.nn.CrossEntropyLoss()

    optimizer = torch.optim.AdamW(
        model.parameters(),
        lr=0.0001,
        weight_decay=0.0001,
    )

    return model, device, criterion, optimizer



def train_one_epoch(model, loader, criterion, optimizer, device):
    """Train the model for one epoch."""

    model.train()

    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in loader:
        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()

        outputs = model(images)
        loss = criterion(outputs, labels)

        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)

        _, predicted = torch.max(outputs, 1)

        total += labels.size(0)
        correct += (predicted == labels).sum().item()

    epoch_loss = running_loss / total
    epoch_accuracy = correct / total

    return epoch_loss, epoch_accuracy



def validate(model, loader, criterion, device):
    """Evaluate the model on the validation dataset."""

    model.eval()

    running_loss = 0.0
    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)
            loss = criterion(outputs, labels)

            running_loss += loss.item() * images.size(0)

            _, predicted = torch.max(outputs, 1)

            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    validation_loss = running_loss / total
    validation_accuracy = correct / total

    return validation_loss, validation_accuracy



def train_model(
    model,
    train_loader,
    validation_loader,
    criterion,
    optimizer,
    device,
    epochs=5,
):
    """Train the model and save the best checkpoint."""

    best_validation_accuracy = 0.0

    for epoch in range(epochs):
        train_loss, train_accuracy = train_one_epoch(
            model,
            train_loader,
            criterion,
            optimizer,
            device,
        )

        validation_loss, validation_accuracy = validate(
            model,
            validation_loader,
            criterion,
            device,
        )

        print(
            f"Epoch [{epoch + 1}/{epochs}] "
            f"Train Loss: {train_loss:.4f} "
            f"Train Acc: {train_accuracy:.4f} "
            f"Val Loss: {validation_loss:.4f} "
            f"Val Acc: {validation_accuracy:.4f}"
        )

        if validation_accuracy > best_validation_accuracy:
            best_validation_accuracy = validation_accuracy

            checkpoint_path = CHECKPOINT_DIR / "model.pt"

            torch.save(
                {
                    "model_state_dict": model.state_dict(),
                    "validation_accuracy": validation_accuracy,
                    "epoch": epoch + 1,
                },
                checkpoint_path,
            )

            print(
                f"Best model saved to: {checkpoint_path}"
            )

    return best_validation_accuracy

        


if __name__ == "__main__":
    classes = get_classes()

    print(f"Dataset path: {DATA_DIR}")
    print(f"Number of classes: {len(classes)}")

    dataset, train_dataset, validation_dataset = create_datasets()

    print(f"\nTotal images: {len(dataset)}")
    print(f"Training images: {len(train_dataset)}")
    print(f"Validation images: {len(validation_dataset)}")

    train_sampler = create_weighted_sampler(train_dataset)

    train_loader = DataLoader(
        train_dataset,
        batch_size=32,
        sampler=train_sampler,
        num_workers=0,
    )

    validation_loader = DataLoader(
        validation_dataset,
        batch_size=32,
        shuffle=False,
        num_workers=0,
    )
    model = create_model(len(classes))

    print(f"\nModel: ResNet18")
    print(f"Output classes: {model.fc.out_features}")

    print(f"Training batches: {len(train_loader)}")
    print(f"Validation batches: {len(validation_loader)}")

    model, device, criterion, optimizer = setup_training(model)

    print(f"\nDevice: {device}")
    print("Starting training...")

    best_accuracy = train_model(
        model,
        train_loader,
        validation_loader,
        criterion,
        optimizer,
        device,
        epochs=5,
    )

    print(
        f"\nTraining completed."
        f"\nBest validation accuracy: {best_accuracy:.4f}"
    )