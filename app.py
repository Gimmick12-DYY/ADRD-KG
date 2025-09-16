from shiny.express import ui, input, render
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Import data with error handling
try:
    from shared import df, disease_types, modalities
    print("Successfully loaded data:", len(df), "rows")
except Exception as e:
    print("Error loading data:", str(e))
    df = pd.DataFrame()
    disease_types = []
    modalities = []
# try:
#     pub_df = pd.read_csv(PUB_PATH)
# except Exception as e:
#     pub_df = pd.DataFrame(
#         {"Error": [str(e)],
#          "Hint": ["Check the file path and close the CSV if it's open in Excel."]}
#     )

# # Detect likely dataset/title columns (adjust if your CSV uses different headers)
# DATASET_COL_CANDIDATES = ["Dataset", "Dataset Name", "dataset", "dataset_name", "Cohort", "cohort"]
# TITLE_COL_CANDIDATES   = ["Title", "title", "Publication Title", "pub_title"]
# ds_col = next((c for c in DATASET_COL_CANDIDATES if c in pub_df.columns), None)
# title_col = next((c for c in TITLE_COL_CANDIDATES if c in pub_df.columns), None)

# dataset_choices = sorted(pub_df[ds_col].dropna().unique().tolist()) if ds_col else []
# title_choices   = sorted(pub_df[title_col].dropna().unique().tolist()) if title_col else []

# preferred_pub_cols = [
#     "Title","title","Authors","authors","Journal","journal","Year","year","PMID","pmid","DOI","doi",
#     "Dataset","Dataset Name","dataset","dataset_name","Cohort","cohort"
# ]
# pub_cols = [c for c in preferred_pub_cols if c in pub_df.columns]
# if not pub_cols:
#     pub_cols = list(pub_df.columns)

# # -------------------- CSS + JS (hash routing) --------------------
# ui.tags.head(
#     ui.tags.style("""
#         html, body {
#             margin: 0;
#             padding: 0;
#             overflow-x: hidden;
#         }

#         /* Fixed top navigation bar (blue, stacked) */
#         .navbar {
#             background-color: #004c97;
#             padding: 1rem 2rem;
#             display: flex;
#             flex-direction: column;
#             align-items: flex-start;
#             color: white;
#             position: fixed;
#             width: 100%;
#             top: 0;
#             left: 0;
#             z-index: 1000;
#         }

#         /* Title row */
#         .navbar-title {
#             font-size: 26px;
#             font-weight: bold;
#             margin-bottom: 8px;
#         }

#         /* Links row */
#         .navbar-links {
#             display: flex;
#             gap: 20px;
#         }

#         .navbar a, .dropdown-btn {
#             color: white;
#             text-decoration: none;
#             font-weight: bold;
#             cursor: pointer;
#         }

#         .navbar .dropdown {
#             position: relative;
#             display: inline-block;
#         }

#         .navbar .dropdown-content {
#             display: none;
#             position: absolute;
#             background-color: white;
#             min-width: 160px;
#             z-index: 2000;
#             box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
#         }
#         .navbar .dropdown-content a {
#             color: black;
#             padding: 12px 16px;
#             display: block;
#             text-decoration: none;
#         }
#         .navbar .dropdown:hover .dropdown-content { display: block; }

#         /* Push main content below navbar */
#         main {
#             margin-top: 120px !important;  /* you can bump this if needed */
#             padding-left: 20px;
#             padding-right: 20px;
#         }

#         /* Sidebar styling */
#         .sidebar {
#             display: none;                 /* hidden unless dataset section */
#             margin-top: 110px !important;  /* push it down below the navbar */
#             position: relative;
#             z-index: 1;                    /* keep under navbar (z=1000) */
#         }
#         html.show-dataset .sidebar { display: block; }

#         /* Sections hidden by default */
#         .section { display: none; }
#         html.show-home #home { display: block; }
#         html.show-dataset #dataset-filter,
#         html.show-dataset #dataset-name { display: block; }
#         html.show-publications #publications { display: block; }  /* publications */

#         /* Sidebar toggle button alignment */
#         .bslib-sidebar-toggle, .sidebar-toggle, [data-bs-toggle="sidebar"] {
#             margin-top: 140px !important;
#         }
#     """),
#     ui.tags.script("""
#         (function() {
#           function updateSection(){
#             var h = window.location.hash || "";
#             var html = document.documentElement;
#             html.classList.toggle('show-home', h === '#home' || h === '');
#             html.classList.toggle('show-dataset', h === '#dataset-filter' || h === '#dataset-name');
#             html.classList.toggle('show-publications', h === '#publications');
#           }
#           window.addEventListener('hashchange', updateSection);
#           window.addEventListener('DOMContentLoaded', updateSection);
#         })();
#     """)
# )

# # -------------------- NAVBAR --------------------
# with ui.tags.div(class_="navbar"):
#     ui.tags.div("ADAtlas: Alzheimer’s Disease and Related Dementia Altas", class_="navbar-title")
#     with ui.tags.div(class_="navbar-links"):
#         ui.tags.a("Home", href="#home")
#         with ui.tags.div(class_="dropdown"):
#             ui.tags.a("Dataset", class_="dropdown-btn")
#             with ui.tags.div(class_="dropdown-content"):
#                 ui.tags.a("By Dataset Name", href="#dataset-name")
#                 ui.tags.a("By Filter", href="#dataset-filter")
#         ui.tags.a("Publication", href="#publications")
#         ui.tags.a("Knowledge Graph", href="#publications")
#         ui.tags.a("Documentation", href="#documentation")

# # -------------------- Home (blank) --------------------
# with ui.tags.div(id="home", class_="section"):
#     ui.tags.div("")

# # -------------------- Sidebar (dataset pages only) --------------------
# with ui.sidebar():
#     ui.input_selectize("disease", "Filter by Disease Type", choices=disease_types, multiple=True)
#     ui.input_selectize("modality", "Filter by Modality", choices=modalities, multiple=True)
#     ui.input_text("search", "Search Dataset Name", placeholder="e.g., ADNI, AMP-AD...")

# # -------------------- Dataset: By Filter --------------------
# with ui.tags.div(id="dataset-filter", class_="section"):
#     @render.data_frame
#     def filtered_df():
#         data = df.copy()

#         if input.disease():
#             data = data[
#                 data["Disease Type (e.g., AD, LBD, FTD, VaD, Mixed) (Text)"].isin(input.disease())
#             ]

#         if input.modality():
#             for mod in input.modality():
#                 col_matches = data.columns[data.columns.str.contains(mod, case=False, na=False)]
#                 if len(col_matches):
#                     data = data[
#                         data[col_matches[0]].astype(str).str.lower().str.contains("yes|available", na=False)
#                     ]

#         if input.search():
#             data = data[
#                 data["Dataset Name (Text)"].astype(str).str.contains(input.search(), case=False, na=False)
#             ]

#         return data[[ 
#             "Dataset Name (Text)", 
#             "Disease Type (e.g., AD, LBD, FTD, VaD, Mixed) (Text)",
#             "Sample Size (Observations) (Integer)", 
#             "Data Accessibility (Text)", 
#             "WGS Data Available (Text)", 
#             "Imaging Data Types Available (Text)"
#         ]]

# # -------------------- Dataset: By Dataset Name (placeholder) --------------------
# with ui.tags.div(id="dataset-name", class_="section"):
#     ui.tags.h3("Search by Dataset Name (coming soon)")

# # -------------------- Publications (with two dropdowns) --------------------
# with ui.tags.div(id="publications", class_="section"):
#     ui.tags.h3("Publications")

#     # Dropdowns similar to the dataset filters
#     ui.input_selectize("pub_ds", "Filter by Dataset Name", choices=dataset_choices, multiple=True)
#     ui.input_selectize("pub_title", "Filter by Publication Title", choices=title_choices, multiple=True)

#     @render.data_frame
#     def publications_table():
#         data = pub_df.copy()

#         if ds_col and input.pub_ds():
#             data = data[data[ds_col].isin(input.pub_ds())]

#         if title_col and input.pub_title():
#             data = data[data[title_col].isin(input.pub_title())]

#         # Show preferred columns if available
#         return data[pub_cols] if set(pub_cols).issubset(data.columns) else data

# from shiny.express import ui, input, render
# import pandas as pd
# from shared import df, disease_types, modalities

# # CSS + JS to control layout and hash-based navigation
# ui.tags.head(
#     ui.tags.style("""
#         html, body {
#             margin: 0;
#             padding: 0;
#             overflow-x: hidden;
#         }

#         /* Fixed top navigation bar (blue, stacked) */
#         .navbar {
#             background-color: #004c97;   /* deep blue */
#             padding: 1rem 2rem;
#             display: flex;
#             flex-direction: column;      /* stack title + links */
#             align-items: flex-start;
#             color: white;
#             position: fixed;
#             width: 100%;
#             top: 0;
#             left: 0;
#             z-index: 1000;
#         }

#         /* Title row */
#         .navbar-title {
#             font-size: 26px;
#             font-weight: bold;
#             margin-bottom: 8px;  /* spacing below title */
#         }

#         /* Links row */
#         .navbar-links {
#             display: flex;
#             gap: 20px;   /* spacing between links */
#         }

#         .navbar a, .dropdown-btn {
#             color: white;
#             text-decoration: none;
#             font-weight: bold;
#             cursor: pointer;
#         }

#         .navbar .dropdown {
#             position: relative;
#             display: inline-block;
#         }

#         .navbar .dropdown-content {
#             display: none;
#             position: absolute;
#             background-color: white;
#             min-width: 160px;
#             z-index: 2000;
#             box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
#         }
#         .navbar .dropdown-content a {
#             color: black;
#             padding: 12px 16px;
#             display: block;
#             text-decoration: none;
#         }
#         .navbar .dropdown:hover .dropdown-content { display: block; }

#         /* Push main content below navbar */
#         main {
#             margin-top: 120px !important;  /* bigger offset for 2 rows */
#             padding-left: 20px;
#             padding-right: 20px;
#         }

#         /* Sidebar hidden by default */
#                 /* Sidebar styling */
#         .sidebar {
#             display: none;                 /* hidden unless dataset section */
#             margin-top: 110px !important;  /* push it down below the navbar */
#             position: relative;            /* prevents overlap with fixed elements */
#             z-index: 1;                    /* keeps it under the navbar (z=1000) */
#         }

#         /* Show sidebar on dataset pages */
#         html.show-dataset .sidebar {
#             display: block;
#         }

#         /* Sections hidden by default */
#         .section { display: none; }
#         html.show-home #home { display: block; }
#         html.show-dataset #dataset-filter,
#         html.show-dataset #dataset-name { display: block; }

#         /* Sidebar toggle button alignment */
#         .bslib-sidebar-toggle, .sidebar-toggle, [data-bs-toggle="sidebar"] {
#             margin-top: 140px !important;
#         }
#     """),
#     ui.tags.script("""
#         (function() {
#           function updateSection(){
#             var h = window.location.hash || "";
#             var html = document.documentElement;
#             html.classList.toggle('show-home', h === '#home' || h === '');
#             html.classList.toggle('show-dataset', h === '#dataset-filter' || h === '#dataset-name');
#           }
#           window.addEventListener('hashchange', updateSection);
#           window.addEventListener('DOMContentLoaded', updateSection);
#         })();
#     """)
# )

# # Navigation bar (blue, stacked)
# with ui.tags.div(class_="navbar"):
#     ui.tags.div("ADAtlas: Alzheimer’s Disease and Related Dementia Altas", class_="navbar-title")
#     with ui.tags.div(class_="navbar-links"):
#         ui.tags.a("Home", href="#home")
#         with ui.tags.div(class_="dropdown"):
#             ui.tags.a("Dataset", class_="dropdown-btn")
#             with ui.tags.div(class_="dropdown-content"):
#                 ui.tags.a("By Dataset Name", href="#dataset-name")
#                 ui.tags.a("By Filter", href="#dataset-filter")
#         ui.tags.a("Publication", href="#publications")
#         ui.tags.a("Knowledge Graph", href="#publications")
#         ui.tags.a("Documentation", href="#documentation")

# # Blank Home page
# with ui.tags.div(id="home", class_="section"):
#     ui.tags.div("")   # intentionally blank

# # Sidebar (hidden unless on dataset)
# with ui.sidebar():
#     ui.input_selectize("disease", "Filter by Disease Type", choices=disease_types, multiple=True)
#     ui.input_selectize("modality", "Filter by Modality", choices=modalities, multiple=True)
#     ui.input_text("search", "Search Dataset Name", placeholder="e.g., ADNI, AMP-AD...")

# # Dataset filter section
# with ui.tags.div(id="dataset-filter", class_="section"):
#     @render.data_frame
#     def filtered_df():
#         data = df.copy()

#         if input.disease():
#             data = data[
#                 data["Disease Type (e.g., AD, LBD, FTD, VaD, Mixed) (Text)"].isin(input.disease())
#             ]

#         if input.modality():
#             for mod in input.modality():
#                 col_matches = data.columns[data.columns.str.contains(mod, case=False, na=False)]
#                 if len(col_matches):
#                     data = data[
#                         data[col_matches[0]]
#                         .astype(str).str.lower().str.contains("yes|available", na=False)
#                     ]

#         if input.search():
#             data = data[
#                 data["Dataset Name (Text)"].astype(str)
#                 .str.contains(input.search(), case=False, na=False)
#             ]

#         return data[[ 
#             "Dataset Name (Text)", 
#             "Disease Type (e.g., AD, LBD, FTD, VaD, Mixed) (Text)",
#             "Sample Size (Observations) (Integer)", 
#             "Data Accessibility (Text)", 
#             "WGS Data Available (Text)", 
#             "Imaging Data Types Available (Text)"
#         ]]

# # # Placeholder for Dataset Name search
# # with ui.tags.div(id="dataset-name", class_="section"):
# #     ui.tags.h3("Search by Dataset Name (coming soon)")


from shiny.express import ui, input, render
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Import data with error handling
try:
    from shared import df, disease_types, modalities
    print("Successfully loaded data:", len(df), "rows")
except Exception as e:
    print("Error loading data:", str(e))
    df = pd.DataFrame()
    disease_types = []
    modalities = []

# -------------------- (Optional) Publications CSV --------------------
PUB_PATH = r"C:\Users\dlsar\Downloads\pubmed_refs_fetched.csv"
try:
    pub_df = pd.read_csv(PUB_PATH)
except Exception as e:
    pub_df = pd.DataFrame(
        {"Error": [str(e)],
         "Hint": ["Check the file path and close the CSV if it's open in Excel."]}
    )

DATASET_COL_CANDIDATES = ["Dataset", "Dataset Name", "dataset", "dataset_name", "Cohort", "cohort"]
TITLE_COL_CANDIDATES   = ["Title", "title", "Publication Title", "pub_title"]
ds_col = next((c for c in DATASET_COL_CANDIDATES if c in pub_df.columns), None)
title_col = next((c for c in TITLE_COL_CANDIDATES if c in pub_df.columns), None)

dataset_choices = sorted(pub_df[ds_col].dropna().unique().tolist()) if ds_col else []
title_choices   = sorted(pub_df[title_col].dropna().unique().tolist()) if title_col else []

preferred_pub_cols = [
    "Title","title","Authors","authors","Journal","journal","Year","year","PMID","pmid","DOI","doi",
    "Dataset","Dataset Name","dataset","dataset_name","Cohort","cohort"
]
pub_cols = [c for c in preferred_pub_cols if c in pub_df.columns]
if not pub_cols:
    pub_cols = list(pub_df.columns)

# -------------------- CSS + JS (hash routing) --------------------
ui.tags.head(
    ui.tags.style("""
        html, body {
            margin: 0;
            padding: 0;
            overflow-x: hidden;
        }

        /* Fixed top navigation bar (blue, stacked) */
        .navbar {
            background-color: #004c97;
            padding: 1rem 2rem;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            color: white;
            position: fixed;
            width: 100%;
            top: 0;
            left: 0;
            z-index: 1000;
        }

        .navbar-title {
            font-size: 26px;
            font-weight: bold;
            margin-bottom: 8px;
        }

        .navbar-links {
            display: flex;
            gap: 20px;
        }

        .navbar a, .dropdown-btn {
            color: white;
            text-decoration: none;
            font-weight: bold;
            cursor: pointer;
        }

        .navbar .dropdown { position: relative; display: inline-block; }
        .navbar .dropdown-content {
            display: none;
            position: absolute;
            background-color: white;
            min-width: 160px;
            z-index: 2000;
            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
        }
        .navbar .dropdown-content a {
            color: black;
            padding: 12px 16px;
            display: block;
            text-decoration: none;
        }
        .navbar .dropdown:hover .dropdown-content { display: block; }

        /* Push content below the two-row navbar */
        main {
            margin-top: 160px !important;
            padding-left: 20px;
            padding-right: 20px;
        }

        /* Sidebar only on dataset pages; push it down too */
        .sidebar {
            display: none;
            margin-top: 160px !important;
            position: relative;
            z-index: 1;
        }
        html.show-dataset .sidebar { display: block; }

        /* Sections are hidden by default; shown via html classes from JS */
        .section { display: none; }
        html.show-home #home { display: block; }
        html.show-dataset #dataset-filter,
        html.show-dataset #dataset-name { display: block; }
        html.show-publications #publications { display: block; }

        /* Sidebar toggle button alignment */
        .bslib-sidebar-toggle, .sidebar-toggle, [data-bs-toggle="sidebar"] {
            margin-top: 160px !important;
        }
    """),
    ui.tags.script("""
        (function() {
          function updateSection(){
            var h = window.location.hash || "";
            var html = document.documentElement;
            html.classList.toggle('show-home', h === '#home' || h === '');
            html.classList.toggle('show-dataset', h === '#dataset-filter' || h === '#dataset-name');
            html.classList.toggle('show-publications', h === '#publications');
          }
          window.addEventListener('hashchange', updateSection);
          window.addEventListener('DOMContentLoaded', updateSection);
        })();
    """)
)

# -------------------- NAVBAR --------------------
with ui.tags.div(class_="navbar"):
    ui.tags.div("ADAtlas: Alzheimer's Disease and Related Dementia Altas", class_="navbar-title")
    with ui.tags.div(class_="navbar-links"):
        ui.tags.a("Home", href="#home")
        with ui.tags.div(class_="dropdown"):
            ui.tags.a("Dataset", class_="dropdown-btn")
            with ui.tags.div(class_="dropdown-content"):
                ui.tags.a("By Dataset Name", href="#dataset-name")
                ui.tags.a("By Filter", href="#dataset-filter")
        ui.tags.a("Publication", href="#publications")
        ui.tags.a("Knowledge Graph", href="#knowledge")
        ui.tags.a("Documentation", href="#documentation")

# -------------------- Home (blank) --------------------
with ui.tags.div(id="home", class_="section"):
    ui.tags.div("")

# -------------------- Sidebar (dataset pages only) --------------------
with ui.sidebar():
    ui.input_selectize("disease", "Filter by Disease Type", choices=disease_types, multiple=True)
    ui.input_selectize("modality", "Filter by Modality", choices=modalities, multiple=True)
    ui.input_text("search", "Search Dataset Name", placeholder="e.g., ADNI, AMP-AD...")

# -------------------- Dataset: By Filter (Chart + Table from Excel data) --------------------
with ui.tags.div(id="dataset-filter", class_="section"):
    ui.tags.h3("Dataset Overview")
    
    # Bar chart of disease types
    @render.plot
    def disease_type_chart():
        import matplotlib.pyplot as plt
        
        # Get the filtered data
        data = df.copy()
        if input.disease():
            data = data[data["Disease Type (e.g., AD, LBD, FTD, VaD, Mixed) (Text)"].isin(input.disease())]
        if input.modality():
            for mod in input.modality():
                col_matches = data.columns[data.columns.str.contains(mod, case=False, na=False)]
                if len(col_matches):
                    data = data[data[col_matches[0]].astype(str).str.lower().str.contains("yes|available", na=False)]
        if input.search():
            data = data[data["Dataset Name (Text)"].astype(str).str.contains(input.search(), case=False, na=False)]
        
        # Create the plot
        fig, ax = plt.subplots(figsize=(10, 8))
        disease_counts = data["Disease Type (e.g., AD, LBD, FTD, VaD, Mixed) (Text)"].value_counts()
        
        # Create an elegant color palette
        elegant_colors = [
            '#445E93',  # Royal blue
            '#8E7DBE',  # Dusty lavender
            '#B6A6CA',  # Soft purple
            '#9CB4CC',  # Steel blue
            '#748DA6',  # Slate blue
            '#6B85A3'   # French blue
        ]
        # Extend the color list if there are more categories than colors
        while len(elegant_colors) < len(disease_counts):
            elegant_colors.extend(elegant_colors)
        
        # Adjust figure size and layout
        plt.subplots_adjust(top=0.85)  # Make more room for title
        
        # Create pie chart with elegant colors
        wedges, texts, autotexts = ax.pie(
            disease_counts.values,
            labels=disease_counts.index,
            autopct='%1.1f%%',
            textprops={'fontsize': 9, 'color': '#2F4F4F'},  # Dark slate gray text
            pctdistance=0.85,
            colors=elegant_colors[:len(disease_counts)]
        )
        
        # Add a circle at the center to create a donut chart effect
        centre_circle = plt.Circle((0, 0), 0.70, fc='white')
        ax.add_artist(centre_circle)
        
        # Add title with adjusted position and style
        plt.title("Distribution of Datasets by Disease Type", 
                 pad=35,  # Increased padding
                 y=1.05,  # Move title up
                 fontsize=12, 
                 fontweight='bold')
        
        # Ensure the pie is drawn as a circle
        ax.axis('equal')
        return fig





    # Filtered table (still below the chart)
    @render.data_frame
    def dataset_table():
        data = df.copy()

        if input.disease():
            data = data[
                data["Disease Type (e.g., AD, LBD, FTD, VaD, Mixed) (Text)"].isin(input.disease())
            ]

        if input.modality():
            for mod in input.modality():
                col_matches = data.columns[data.columns.str.contains(mod, case=False, na=False)]
                if len(col_matches):
                    data = data[
                        data[col_matches[0]].astype(str).str.lower().str.contains("yes|available", na=False)
                    ]

        if input.search():
            data = data[
                data["Dataset Name (Text)"].astype(str).str.contains(input.search(), case=False, na=False)
            ]

        return data[[ 
            "Dataset Name (Text)", 
            "Disease Type (e.g., AD, LBD, FTD, VaD, Mixed) (Text)",
            "Sample Size (Observations) (Integer)", 
            "Data Accessibility (Text)", 
            "WGS Data Available (Text)", 
            "Imaging Data Types Available (Text)"
        ]]



# -------------------- Publications (dropdowns + table) --------------------
with ui.tags.div(id="publications", class_="section"):
    ui.tags.h3("Publications")

    ui.input_selectize("pub_ds", "Filter by Dataset Name", choices=dataset_choices, multiple=True)
    ui.input_selectize("pub_title", "Filter by Publication Title", choices=title_choices, multiple=True)

    @render.data_frame
    def publications_table():
        data = pub_df.copy()

        if ds_col and input.pub_ds():
            data = data[data[ds_col].isin(input.pub_ds())]

        if title_col and input.pub_title():
            data = data[data[title_col].isin(input.pub_title())]

        return data[pub_cols] if set(pub_cols).issubset(data.columns) else data
