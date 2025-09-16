# import pandas as pd

# # Load Excel file (replace with your actual path)
# df = pd.read_excel(r"C:\Users\dlsar\Documents\ADRD_Web\basic-sidebar\ADRD_Metadata_Sample.xlsx")

# # Extract unique values for sidebar filters
# disease_types = sorted(df["Disease Type (e.g., AD, LBD, FTD, VaD, Mixed) (Text)"].dropna().unique())

# # You can manually update this list based on your columns
# modalities = ["MRI", "fMRI", "PET", "DTI", "ASL", "SNP", "WGS", "WES", "RNA-seq", "Epigenomic", "Proteomics", "Metabolomics"]

import pandas as pd

# Load the Excel file with absolute path
df = pd.read_excel(r"C:\Users\dlsar\Documents\ADRD_Web\basic-sidebar\ADRD_Metadata_Sample.xlsx")

# Extract disease types from the data
disease_types = sorted(df["Disease Type (e.g., AD, LBD, FTD, VaD, Mixed) (Text)"].dropna().unique())

# Define modalities (these should match column names in your Excel file)
modalities = [
    "MRI", "fMRI", "PET", "DTI", "ASL",
    "SNP Genotyping", "WGS", "WES", "RNA", "Epigenomics", "Proteomics", "Metabolomics",
    "EHR", "Clinical Cognitive Tests"
]
