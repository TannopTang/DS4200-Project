import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("Spotify_Song_Attributes_Cleaned.csv")
df = df[~df["major_genre"].isin(["Unknown", "Other"])]
df = df[df["duration_min"] < 10]

genres = sorted(df["major_genre"].unique())

fig, axes = plt.subplots(4, 4, figsize=(16, 12))
axes = axes.flatten()

for i, genre in enumerate(genres):
    genre_df = df[df["major_genre"] == genre]
    axes[i].hist(genre_df["duration_min"], bins=20, color="green", edgecolor="white")
    axes[i].set_title(genre, fontsize=11, fontweight="bold")
    axes[i].set_xlabel("Duration (min)", fontsize=9)
    axes[i].set_ylabel("Count", fontsize=9)

for j in range(len(genres), len(axes)):
    axes[j].set_visible(False)

fig.suptitle("Distribution of Song Duration by Genre", fontsize=16, fontweight="bold", y=1.02)
plt.tight_layout()
plt.savefig("/Users/kaitlyndu/Documents/data-viz/DS4200-Project/histogram.png", dpi=150, bbox_inches="tight")
print("Saved to histogram.png")