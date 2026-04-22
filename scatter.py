import pandas as pd
import altair as alt

alt.data_transformers.disable_max_rows()

df = pd.read_csv("Spotify_Song_Attributes_Cleaned.csv")
df = df[~df["major_genre"].isin(["Unknown", "Other"])]

genre_list = sorted(df["major_genre"].unique().tolist())
genre_list.insert(0, "All Genres")

dropdown = alt.binding_select(options=genre_list, name="Genre: ")
selection = alt.param(name="selected_genre", bind=dropdown, value="All Genres")

scatter = alt.Chart(df).mark_circle(size=30, color="green").transform_filter(
    "(selected_genre === 'All Genres') || (datum.major_genre === selected_genre)"
).encode(
    x=alt.X("acousticness", title="Acousticness", scale=alt.Scale(zero=False)),
    y=alt.Y("energy", title="Energy", scale=alt.Scale(zero=False)),
    opacity=alt.value(0.3),
    tooltip=["trackname", "artistname", "major_genre", "acousticness", "energy"]
).add_params(
    selection
).properties(
    title="Acousticness vs. Energy by Genre",
    width=600,
    height=400
)

scatter.save("/Users/kaitlyndu/Documents/data-viz/DS4200-Project/scatter.html")
print("Saved to scatter.html")