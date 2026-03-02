from ml_pipeline.preprocessing import generate_features
from ml_pipeline.train_model import train

def main():
    generate_features()
    train()

if __name__ == "__main__":
    main()