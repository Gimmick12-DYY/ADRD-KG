from shiny import App, ui, render
import pandas as pd
import matplotlib.pyplot as plt

# Import data with error handling and error message capturing
error_messages = []

try:
    from shared import df, disease_types, modalities
    data_loaded = True
    print("Successfully loaded data:", len(df), "rows")
except Exception as e:
    error_messages.append(f"Error loading data: {str(e)}")
    print("Error loading data:", str(e))
    df = pd.DataFrame()
    disease_types = []
    modalities = []
    data_loaded = False

# Publications data
PUB_PATH = r"C:\Users\dlsar\Downloads\pubmed_refs_fetched.csv"
try:
    pub_df = pd.read_csv(PUB_PATH)
except Exception as e:
    pub_df = pd.DataFrame(
        {"Error": [str(e)],
         "Hint": ["Check the file path and close the CSV if it's open in Excel."]}
    )

# Calculate statistics
total_diseases = len(disease_types) if disease_types else 0
total_datasets = len(df['Dataset Name (Text)'].unique()) if not df.empty else 0
total_publications = len(pub_df) if not pub_df.empty else 0
total_traits = len(df.filter(like='Available').columns) if not df.empty else 0

app_ui = ui.page_fluid(
    # Add error messages at the top if there are any
    ui.panel_conditional(
        "Object.keys(error_messages).length > 0",
        ui.div(
            {"class": "error-message"},
            ui.tags.h4("Warning: Some data could not be loaded"),
            ui.tags.ul([ui.tags.li(msg) for msg in error_messages])
        )
    ) if error_messages else None,
    ui.tags.head(
        ui.tags.style("""
            html, body {
                margin: 0;
                padding: 0;
                overflow-x: hidden;
                background-color: #f5f7fa;
            }
            
            .content {
                padding: 20px;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .stats-container {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 20px;
                padding: 20px;
                margin: 20px auto;
            }
            
            .stat-card {
                background: white;
                border-radius: 12px;
                padding: 25px;
                width: 220px;
                text-align: center;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                border: 1px solid #e0e0e0;
                text-decoration: none;
            }
            
            .stat-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
            }
            
            .stat-number {
                font-size: 2.8em;
                font-weight: bold;
                color: #445E93;
                margin: 15px 0;
                font-family: 'Arial', sans-serif;
            }
            
            .stat-label {
                color: #4a5568;
                font-size: 1.2em;
                font-weight: 500;
                margin-top: 5px;
            }
            
            .stat-icon {
                font-size: 2.2em;
                color: #8E7DBE;
                margin-bottom: 15px;
            }
            
            .section-title {
                text-align: center;
                font-size: 2em;
                color: #2d3748;
                margin: 40px 0 30px;
                font-weight: 600;
            }
            
            .welcome-text {
                text-align: center;
                color: #4a5568;
                font-size: 1.1em;
                margin-bottom: 40px;
                max-width: 800px;
                margin-left: auto;
                margin-right: auto;
            }
            
            .section-content {
                margin-top: 40px;
                padding: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .error-message {
                background-color: #FEE2E2;
                border: 1px solid #FCA5A5;
                color: #B91C1C;
                padding: 1rem;
                margin: 1rem 0;
                border-radius: 0.375rem;
            }
        """)
    ),
    
    ui.layout_sidebar(
        ui.sidebar(
            ui.h3("Filters"),
            ui.hr(),
            ui.input_selectize(
                "disease",
                "Disease Types:",
                choices=disease_types,
                multiple=True
            ),
            ui.input_selectize(
                "modality",
                "Modalities:",
                choices=modalities,
                multiple=True
            ),
            ui.input_text("search", "Search:", placeholder="Enter keywords..."),
            bg="#f8f9fa"
        ),
        
        ui.div(
            {"class": "content"},
            ui.h2({"class": "section-title"}, "ADRD Data Statistics"),
            ui.p(
                {"class": "welcome-text"},
                "Welcome to the ADRD Dataset Explorer. Browse our comprehensive collection of "
                "Alzheimer's Disease and Related Dementia datasets, publications, and resources."
            ),
            
            ui.div(
                {"class": "stats-container"},
                ui.div(
                    {"class": "stat-card", "id": "diseases-card"},
                    ui.div({"class": "stat-icon"}, "🔬"),
                    ui.div({"class": "stat-number"}, str(total_diseases)),
                    ui.div({"class": "stat-label"}, "Disease Types")
                ),
                
                ui.div(
                    {"class": "stat-card", "id": "datasets-card"},
                    ui.div({"class": "stat-icon"}, "📊"),
                    ui.div({"class": "stat-number"}, str(total_datasets)),
                    ui.div({"class": "stat-label"}, "Datasets")
                ),
                
                ui.div(
                    {"class": "stat-card", "id": "traits-card"},
                    ui.div({"class": "stat-icon"}, "🧬"),
                    ui.div({"class": "stat-number"}, str(total_traits)),
                    ui.div({"class": "stat-label"}, "Available Traits")
                ),
                
                ui.div(
                    {"class": "stat-card", "id": "publications-card"},
                    ui.div({"class": "stat-icon"}, "📚"),
                    ui.div({"class": "stat-number"}, str(total_publications)),
                    ui.div({"class": "stat-label"}, "Publications")
                )
            ),
            
            ui.div(
                {"class": "section-content"},
                ui.output_plot("disease_type_chart"),
                ui.output_data_frame("dataset_table")
            )
        )
    )
)

def server(input, output, session):
    @output
    @render.data_frame
    def dataset_table():
        filtered_df = df.copy()
        if input.disease():
            filtered_df = filtered_df[filtered_df["Disease Type (e.g., AD, LBD, FTD, VaD, Mixed) (Text)"].isin(input.disease())]
        if input.modality():
            for mod in input.modality():
                col_matches = filtered_df.columns[filtered_df.columns.str.contains(mod, case=False, na=False)]
                if len(col_matches):
                    filtered_df = filtered_df[filtered_df[col_matches[0]].astype(str).str.lower().str.contains("yes|available", na=False)]
        if input.search():
            filtered_df = filtered_df[filtered_df["Dataset Name (Text)"].str.contains(input.search(), case=False, na=False)]
        return filtered_df[['Dataset Name (Text)', 'Disease Type (e.g., AD, LBD, FTD, VaD, Mixed) (Text)']]

    @output
    @render.plot
    def disease_type_chart():
        # Create the plot
        fig, ax = plt.subplots(figsize=(10, 8))
        disease_counts = df["Disease Type (e.g., AD, LBD, FTD, VaD, Mixed) (Text)"].value_counts()
        
        # Create pie chart with elegant colors
        elegant_colors = ['#445E93', '#8E7DBE', '#B6A6CA', '#9CB4CC', '#748DA6', '#6B85A3']
        while len(elegant_colors) < len(disease_counts):
            elegant_colors.extend(elegant_colors)
        
        wedges, texts, autotexts = ax.pie(
            disease_counts.values,
            labels=disease_counts.index,
            autopct='%1.1f%%',
            textprops={'fontsize': 9, 'color': '#2F4F4F'},
            pctdistance=0.85,
            colors=elegant_colors[:len(disease_counts)]
        )
        
        # Add a circle at the center to create a donut chart effect
        centre_circle = plt.Circle((0, 0), 0.70, fc='white')
        ax.add_artist(centre_circle)
        
        # Add title with adjusted position and style
        plt.title("Distribution of Datasets by Disease Type",
                pad=35,
                y=1.05,
                fontsize=12,
                fontweight='bold')
        
        # Ensure the pie is drawn as a circle
        ax.axis('equal')
        plt.subplots_adjust(top=0.85)
        
        return fig

app = App(app_ui, server)
