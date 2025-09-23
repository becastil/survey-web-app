#!/usr/bin/env python3
"""
Main entry point for building the Health Care Benefits Strategy Survey report.
Loads CSV data and generates a multi-page PDF with charts and tables.
"""
import os
import sys
import pandas as pd
from matplotlib.backends.backend_pdf import PdfPages
import matplotlib.pyplot as plt

# Add the src directory to Python path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from charts import bar_chart, horizontal_bar_chart, table_page
from pages import create_cover_page, create_executive_summary


def load_csv_data(csv_path, required_columns):
    """
    Load and validate CSV data.
    
    Args:
        csv_path: Path to CSV file
        required_columns: List of required column names
    
    Returns:
        pandas DataFrame
    
    Raises:
        FileNotFoundError: If CSV file doesn't exist
        ValueError: If required columns are missing
    """
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"CSV file not found: {csv_path}")
    
    df = pd.read_csv(csv_path)
    
    missing_cols = [col for col in required_columns if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing required columns in {csv_path}: {missing_cols}")
    
    return df


def create_all_charts():
    """
    Create all chart figures and return as a list.
    
    Returns:
        List of (figure, title) tuples
    """
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
    figures = []
    
    # 1. Product Mix – Types of Plans Offered (Fig 1.5)
    try:
        df = load_csv_data(os.path.join(data_dir, 'product_mix_offered.csv'), ['Plan', 'Percent'])
        fig = bar_chart(df, 'Plan', 'Percent', 
                       'Product Mix – Types of Plans Offered (Fig 1.5)',
                       ylabel='Percentage of Organizations', 
                       value_fmt='percent')
        figures.append((fig, 'product_mix_offered'))
    except Exception as e:
        print(f"Error creating product mix chart: {e}")
    
    # 2. Funding Approaches (Fig 1.9)
    try:
        df = load_csv_data(os.path.join(data_dir, 'funding.csv'), ['Type', 'Percent'])
        fig = bar_chart(df, 'Type', 'Percent',
                       'Funding Approaches (Fig 1.9)',
                       ylabel='Percentage of Organizations',
                       value_fmt='percent')
        figures.append((fig, 'funding_approaches'))
    except Exception as e:
        print(f"Error creating funding chart: {e}")
    
    # 3. Self-funded Network (Fig 1.11)
    try:
        df = load_csv_data(os.path.join(data_dir, 'network.csv'), ['Network', 'Percent'])
        fig = horizontal_bar_chart(df, 'Network', 'Percent',
                                  'Self-funded Network (Fig 1.11)',
                                  xlabel='Percentage of Organizations',
                                  value_fmt='percent')
        figures.append((fig, 'self_funded_network'))
    except Exception as e:
        print(f"Error creating network chart: {e}")
    
    # 4. Cost of Services at Own Hospital (Fig 1.12)
    try:
        df = load_csv_data(os.path.join(data_dir, 'own_hospital_cost.csv'), ['Method', 'Percent'])
        fig = bar_chart(df, 'Method', 'Percent',
                       'Cost of Services at Own Hospital (Fig 1.12)',
                       ylabel='Percentage of Organizations',
                       rotation=45, value_fmt='percent')
        figures.append((fig, 'own_hospital_cost'))
    except Exception as e:
        print(f"Error creating hospital cost chart: {e}")
    
    # 5. 2022 Medical Cost PEPM by Region (Fig 1.13)
    try:
        df = load_csv_data(os.path.join(data_dir, 'monthly_cost_pepm.csv'), ['Region', 'PEPM'])
        fig = bar_chart(df, 'Region', 'PEPM',
                       '2022 Medical Cost PEPM by Region (Fig 1.13)',
                       ylabel='Cost Per Employee Per Month',
                       rotation=45, value_fmt='currency')
        figures.append((fig, 'monthly_cost_pepm'))
    except Exception as e:
        print(f"Error creating PEPM chart: {e}")
    
    # 6. No-cost Plan Prevalence – EE Only (Fig 1.14)
    try:
        df = load_csv_data(os.path.join(data_dir, 'no_cost_ee_only.csv'), ['Region', 'Percent'])
        fig = bar_chart(df, 'Region', 'Percent',
                       'No-cost Plan Prevalence – EE Only (Fig 1.14)',
                       ylabel='Percentage of Organizations',
                       rotation=45, value_fmt='percent')
        figures.append((fig, 'no_cost_ee_only'))
    except Exception as e:
        print(f"Error creating no-cost plan chart: {e}")
    
    # 7. Telemedicine & Teletherapy Access (Fig 1.21-1.22)
    try:
        df = load_csv_data(os.path.join(data_dir, 'tele_access.csv'), ['Benefit', 'Percent'])
        fig = bar_chart(df, 'Benefit', 'Percent',
                       'Telemedicine & Teletherapy Access (Fig 1.21-1.22)',
                       ylabel='Percentage of Organizations',
                       value_fmt='percent')
        figures.append((fig, 'tele_access'))
    except Exception as e:
        print(f"Error creating telemedicine access chart: {e}")
    
    # 8. Telemedicine Copay vs PCP Relationship (Fig 1.21)
    try:
        df = load_csv_data(os.path.join(data_dir, 'tele_copay_relationship.csv'), ['Relationship', 'Percent'])
        fig = horizontal_bar_chart(df, 'Relationship', 'Percent',
                                  'Telemedicine Copay vs PCP Relationship (Fig 1.21)',
                                  xlabel='Percentage of Organizations',
                                  value_fmt='percent')
        figures.append((fig, 'tele_copay_relationship'))
    except Exception as e:
        print(f"Error creating copay relationship chart: {e}")
    
    # 9. Stop-loss Specific Attachment Points (Fig 1.24)
    try:
        df = load_csv_data(os.path.join(data_dir, 'stop_loss_attachment_points.csv'), ['Attachment Point', 'Percent'])
        fig = horizontal_bar_chart(df, 'Attachment Point', 'Percent',
                                  'Stop-loss Specific Attachment Points (Fig 1.24)',
                                  xlabel='Percentage of Organizations',
                                  value_fmt='percent')
        figures.append((fig, 'stop_loss_attachment'))
    except Exception as e:
        print(f"Error creating stop-loss chart: {e}")
    
    # 10. HDHP Offering (Fig 1.42)
    try:
        df = load_csv_data(os.path.join(data_dir, 'hdhp_offering.csv'), ['Category', 'Percent'])
        fig = bar_chart(df, 'Category', 'Percent',
                       'HDHP Offering (Fig 1.42)',
                       ylabel='Percentage of Organizations',
                       rotation=15, value_fmt='percent')
        figures.append((fig, 'hdhp_offering'))
    except Exception as e:
        print(f"Error creating HDHP chart: {e}")
    
    # 11. Dental Options Offered (Fig 1.49)
    try:
        df = load_csv_data(os.path.join(data_dir, 'dental_offerings.csv'), ['Plan', 'Percent'])
        fig = bar_chart(df, 'Plan', 'Percent',
                       'Dental Options Offered (Fig 1.49)',
                       ylabel='Percentage of Organizations',
                       value_fmt='percent')
        figures.append((fig, 'dental_offerings'))
    except Exception as e:
        print(f"Error creating dental chart: {e}")
    
    # 12. Union Representation Mix (Fig 1.3)
    try:
        df = load_csv_data(os.path.join(data_dir, 'union_rep.csv'), ['Category', 'Percent'])
        fig = bar_chart(df, 'Category', 'Percent',
                       'Union Representation Mix (Fig 1.3)',
                       ylabel='Percentage of Organizations',
                       value_fmt='percent')
        figures.append((fig, 'union_representation'))
    except Exception as e:
        print(f"Error creating union representation chart: {e}")
    
    # 13. Appendix EE Contributions Table (Optional)
    try:
        df = load_csv_data(os.path.join(data_dir, 'appendix_ee_contributions.csv'), 
                          ['Plan Type', 'Employee Only', 'Employee + Spouse', 'Employee + Child(ren)', 'Employee + Family'])
        fig = table_page(df, 'Employee Contributions by Plan Type (Appendix A)')
        figures.append((fig, 'appendix_ee_contributions'))
    except Exception as e:
        print(f"Error creating appendix table: {e}")
    
    return figures


def main():
    """Main function to build the complete report."""
    # Setup paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    out_dir = os.path.join(project_root, 'out')
    figures_dir = os.path.join(out_dir, 'figures')
    
    # Ensure output directories exist
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(figures_dir, exist_ok=True)
    
    # Create the PDF report
    pdf_path = os.path.join(out_dir, 'report.pdf')
    
    print("Building Health Care Benefits Strategy Survey Report...")
    
    try:
        with PdfPages(pdf_path) as pdf:
            page_num = 1
            
            # Cover page
            print(f"Creating page {page_num}: Cover page")
            cover_fig = create_cover_page()
            pdf.savefig(cover_fig, bbox_inches='tight')
            cover_fig.savefig(os.path.join(figures_dir, f'page_{page_num:02d}_cover.png'), 
                             bbox_inches='tight', dpi=150)
            plt.close(cover_fig)
            page_num += 1
            
            # Executive summary
            print(f"Creating page {page_num}: Executive summary")
            exec_fig = create_executive_summary()
            pdf.savefig(exec_fig, bbox_inches='tight')
            exec_fig.savefig(os.path.join(figures_dir, f'page_{page_num:02d}_executive_summary.png'), 
                            bbox_inches='tight', dpi=150)
            plt.close(exec_fig)
            page_num += 1
            
            # All charts
            figures = create_all_charts()
            for fig, name in figures:
                print(f"Creating page {page_num}: {name}")
                pdf.savefig(fig, bbox_inches='tight')
                fig.savefig(os.path.join(figures_dir, f'page_{page_num:02d}_{name}.png'), 
                           bbox_inches='tight', dpi=150)
                plt.close(fig)
                page_num += 1
        
        print(f"\nReport generated successfully!")
        print(f"PDF saved to: {pdf_path}")
        print(f"Individual pages saved to: {figures_dir}")
        print(f"Total pages: {page_num - 1}")
        
    except Exception as e:
        print(f"Error generating report: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()