import json
import random
import re
from datetime import datetime
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns


# ============================================================
# SETTINGS
# ============================================================

random.seed(42)
np.random.seed(42)

NUMBER_OF_DAYS = 60

SCRIPT_DIR = Path(__file__).resolve().parent
CHARTS_DIR = SCRIPT_DIR / "charts"

CHARTS_DIR.mkdir(parents=True, exist_ok=True)

sns.set_theme(style="whitegrid")




AMENITIES = [
    {
        "amenity_id": 1,
        "name": "Accessible entrance",
        "searches": 34,
        "demand_rate": 0.10,
    },
    {
        "amenity_id": 2,
        "name": "Accessible toilet",
        "searches": 51,
        "demand_rate": 0.18,
    },
    {
        "amenity_id": 3,
        "name": "Prams allowed",
        "searches": 72,
        "demand_rate": 0.38,
    },
    {
        "amenity_id": 4,
        "name": "Pram storage",
        "searches": 43,
        "demand_rate": 0.14,
    },
    {
        "amenity_id": 5,
        "name": "Changing facilities",
        "searches": 78,
        "demand_rate": 0.48,
    },
    {
        "amenity_id": 6,
        "name": "Table reservation",
        "searches": 29,
        "demand_rate": 0.07,
    },
    {
        "amenity_id": 7,
        "name": "Breastfeeding friendly",
        "searches": 58,
        "demand_rate": 0.27,
    },
    {
        "amenity_id": 8,
        "name": "Children's activities",
        "searches": 63,
        "demand_rate": 0.33,
    },
    {
        "amenity_id": 9,
        "name": "Parking",
        "searches": 46,
        "demand_rate": 0.21,
    },
    {
        "amenity_id": 10,
        "name": "High chairs",
        "searches": 66,
        "demand_rate": 0.42,
    },
]


# ============================================================
# HELPERS
# ============================================================

def safe_filename(text):
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def save_chart(filename):
    path = CHARTS_DIR / filename

    plt.tight_layout()

    plt.savefig(
        path,
        dpi=180,
        bbox_inches="tight",
    )

    plt.close()

    print(f"Created: {filename}")

    return path


# ============================================================
# CREATE 60 DAYS OF SIMULATED VENUE VIEWS
# ============================================================
#
# This data is intentionally simulated for the business
# dashboard demo.
#
# It does NOT represent a particular real venue.
# ============================================================

end_date = datetime.now().date()

dates = pd.date_range(
    end=end_date,
    periods=NUMBER_OF_DAYS,
    freq="D",
)

day_numbers = np.arange(NUMBER_OF_DAYS)

# Gradual increase across the demo period.
trend = 7 + (day_numbers * 0.08)

# Weekly behaviour pattern.
weekly_pattern = (
    2
    * np.sin(
        2 * np.pi * day_numbers / 7
    )
)

# Small amount of random variation.
noise = np.random.normal(
    loc=0,
    scale=1.4,
    size=NUMBER_OF_DAYS,
)

views = (
    trend
    + weekly_pattern
    + noise
)

views = np.maximum(
    np.round(views),
    1,
).astype(int)

views_df = pd.DataFrame(
    {
        "date": dates,
        "views": views,
    }
)

print("\nGenerated simulated venue views:")
print(views_df.head())


# ============================================================
# BASE VENUE VIEWS GRAPH
# ============================================================

plt.figure(figsize=(11, 5))

sns.lineplot(
    data=views_df,
    x="date",
    y="views",
    marker="o",
    color="blue",
    linewidth=2,
)

plt.title("Venue views over time")

plt.xlabel("Date")
plt.ylabel("Venue views")

plt.xticks(rotation=45)

save_chart(
    "venue-views.png"
)


# ============================================================
# CREATE PROJECTION GRAPH FOR EACH AMENITY
# ============================================================


opportunities = []

for amenity in AMENITIES:

    amenity_id = amenity["amenity_id"]
    amenity_name = amenity["name"]
    searches = amenity["searches"]
    demand_rate = amenity["demand_rate"]

    projection_df = views_df.copy()

    # --------------------------------------------------------
    # Amenity-specific simulated variation
    # --------------------------------------------------------

    projection_noise = np.random.default_rng(
        100 + amenity_id
    ).normal(
        loc=0,
        scale=0.6 + (demand_rate * 2),
        size=NUMBER_OF_DAYS,
    )

    # --------------------------------------------------------
    # Simulated projected views
    # --------------------------------------------------------

    projection_df["estimated_views"] = (
        projection_df["views"] * (1 + demand_rate)
        + projection_noise
    )


    projection_df["estimated_views"] = np.maximum(
        np.round(
            projection_df["estimated_views"]
        ),
        projection_df["views"],
    ).astype(int)

    # --------------------------------------------------------
    # Make graph
    # --------------------------------------------------------

    plt.figure(figsize=(11, 5))

    sns.lineplot(
        data=projection_df,
        x="date",
        y="views",
        marker="o",
        label="Current views",
        color="blue",
        linewidth=2,
    )

    sns.lineplot(
        data=projection_df,
        x="date",
        y="estimated_views",
        marker="o",
        linestyle="--",
        label=f"Projected with {amenity_name}",
        color="red",
        linewidth=2,
    )

    plt.title(
        f"Potential venue views with "
        f"{amenity_name}"
    )

    plt.xlabel("Date")
    plt.ylabel("Venue views")

    plt.xticks(rotation=45)

    plt.figtext(
        0.5,
        -0.04,
        (
            f"This graph shows an estimate, not a guaranteed increase."
        ),
        ha="center",
        fontsize=9,
    )

    filename = (
        f"projection-"
        f"{safe_filename(amenity_name)}.png"
    )

    save_chart(filename)

    # --------------------------------------------------------
    # Save info for frontend JSON
    # --------------------------------------------------------

    opportunities.append(
        {
            "amenity_id": amenity_id,
            "name": amenity_name,
            "searches": searches,
            "demand_rate": demand_rate,
            "projection_chart": (
                f"/analytics/{filename}"
            ),
        }
    )


# ============================================================
# AMENITY DEMAND GRAPH
# ============================================================

amenity_demand_df = pd.DataFrame(
    AMENITIES
)

amenity_demand_df = (
    amenity_demand_df
    .sort_values(
        "searches",
        ascending=False,
    )
)

plt.figure(figsize=(10, 6))

sns.barplot(
    data=amenity_demand_df,
    x="searches",
    y="name",
)

plt.title(
    "Most requested amenities"
)

plt.xlabel(
    "Relevant searches requesting amenity"
)

plt.ylabel("")

save_chart(
    "amenity-demand.png"
)


# ============================================================
# SIMULATED SEARCH HEATMAP
# ============================================================
#
# This gives us the existing "When parents search" graph.
# ============================================================

days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]

hours = list(
    range(7, 22)
)

heatmap_values = []

for day_index in range(len(days)):

    row = []

    for hour in hours:

        # Base demand
        value = random.randint(
            1,
            5,
        )

        # Morning
        if 8 <= hour <= 10:
            value += random.randint(
                3,
                8,
            )

        # Lunchtime
        if 11 <= hour <= 14:
            value += random.randint(
                5,
                12,
            )

        # Afternoon
        if 15 <= hour <= 17:
            value += random.randint(
                3,
                9,
            )

        # Weekend boost
        if day_index >= 5:
            value += random.randint(
                2,
                7,
            )

        row.append(value)

    heatmap_values.append(row)


heatmap_df = pd.DataFrame(
    heatmap_values,
    index=days,
    columns=hours,
)


plt.figure(figsize=(11, 5))

sns.heatmap(
    heatmap_df,
    cmap="YlOrBr",
    cbar_kws={
        "label": "Searches"
    },
)

plt.title(
    "When parents search"
)

plt.xlabel(
    "Hour of day"
)

plt.ylabel("")

save_chart(
    "search-heatmap.png"
)


# ============================================================
# SIMULATED SEARCH DEMAND
# ============================================================

search_demand = []

for i, date in enumerate(dates):

    base = 18

    trend_value = i * 0.10

    weekly_value = (
        4
        * np.sin(
            2 * np.pi * i / 7
        )
    )

    noise_value = (
        np.random.normal(
            0,
            2,
        )
    )

    searches = (
        base
        + trend_value
        + weekly_value
        + noise_value
    )

    searches = max(
        round(searches),
        1,
    )

    search_demand.append(
        {
            "date": date,
            "searches": searches,
        }
    )


search_demand_df = pd.DataFrame(
    search_demand
)


plt.figure(figsize=(11, 5))

sns.lineplot(
    data=search_demand_df,
    x="date",
    y="searches",
)

plt.title(
    "Search demand over time"
)

plt.xlabel(
    "Date"
)

plt.ylabel(
    "Relevant searches"
)

plt.xticks(
    rotation=45
)

save_chart(
    "search-demand.png"
)


# ============================================================
# BUSINESS ANALYTICS JSON
# ============================================================

# There is NO venue ID or venue name here.

# That's deliberate.

# The real venue comes from:

# GET /venues/mine


analytics_data = {
    "generated_at": datetime.now().isoformat(),

    "is_demo_data": True,

    "views": int(
        views_df["views"].sum()
    ),

    "relevant_searches": int(
        search_demand_df[
            "searches"
        ].sum()
    ),

    "views_chart": (
        "/analytics/venue-views.png"
    ),

    "amenity_demand_chart": (
        "/analytics/amenity-demand.png"
    ),

    "search_heatmap_chart": (
        "/analytics/search-heatmap.png"
    ),

    "search_demand_chart": (
        "/analytics/search-demand.png"
    ),

    "projection_method": (
        "Projected views use amenity demand rates "
        "plus small amenity specific variation. "
    
    ),

    "opportunities": opportunities,
}


json_path = (
    CHARTS_DIR
    / "business-analytics.json"
)

with open(
    json_path,
    "w",
    encoding="utf-8",
) as file:

    json.dump(
        analytics_data,
        file,
        indent=2,
        ensure_ascii=False,
    )


print(
    "\nCreated: "
    "business-analytics.json"
)


# ============================================================
# FINISHED
# ============================================================

print("\n================================")
print("BUSINESS ANALYTICS GENERATED")
print("================================")

print(
    f"\nOutput folder:\n"
    f"{CHARTS_DIR}"
)

print(
    f"\nBase venue views: "
    f"{analytics_data['views']}"
)

print(
    f"Relevant searches: "
    f"{analytics_data['relevant_searches']}"
)

print(
    f"Amenity projections: "
    f"{len(opportunities)}"
)

print(
    "\nAll analytics are simulated "
    "for demonstration purposes."
)