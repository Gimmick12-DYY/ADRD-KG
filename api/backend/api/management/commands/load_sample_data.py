from django.core.management.base import BaseCommand
from django.conf import settings
import os
import pandas as pd
from api.models import Dataset, Publication


class Command(BaseCommand):
    help = 'Load sample data from Excel file'

    def handle(self, *args, **options):
        try:
            # Try to load from the Excel file
            excel_path = os.path.join(settings.BASE_DIR.parent, 'ADRD_Metadata_Sample_Big.xlsx')
            if os.path.exists(excel_path):
                df = pd.read_excel(excel_path)
                
                loaded_count = 0
                for _, row in df.iterrows():
                    # Check if dataset already exists
                    existing = Dataset.objects.filter(
                        name=row.get('Dataset Name (Text)', '')
                    ).first()
                    if not existing and row.get('Dataset Name (Text)', ''):
                        # Handle sample_size field - extract number from string if needed
                        sample_size_raw = row.get('Sample Size (Observations) (Integer)', None)
                        sample_size = None
                        if sample_size_raw:
                            try:
                                # Try to extract number from string like "1518 (blood-based omics in ADNI)"
                                import re
                                numbers = re.findall(r'\d+', str(sample_size_raw))
                                if numbers:
                                    sample_size = int(numbers[0])
                            except (ValueError, TypeError):
                                sample_size = None
                        
                        dataset = Dataset(
                            name=row.get('Dataset Name (Text)', ''),
                            description=row.get('Description', ''),
                            disease_type=row.get('Disease Type (e.g., AD, LBD, FTD, VaD, Mixed) (Text)', ''),
                            sample_size=sample_size,
                            data_accessibility=row.get('Data Accessibility (Text)', ''),
                            wgs_available=row.get('WGS Data Available (Text)', ''),
                            imaging_types=row.get('Imaging Data Types Available (Text)', ''),
                            modalities='["MRI", "PET", "WGS"]'  # This should be properly parsed
                        )
                        dataset.save()
                        loaded_count += 1
                
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully loaded {loaded_count} datasets from Excel file')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Excel file not found at {excel_path}')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error loading sample data: {e}')
            )
