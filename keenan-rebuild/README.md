# Keenan Healthcare Benefits Survey Report Recreation

This project recreates key charts and tables from the **Health Care Benefits Strategy 2022 Survey** by Keenan & Associates into a multi-page PDF using pure pandas and matplotlib.

## Setup & Run

```bash
python -m venv .venv && source .venv/bin/activate    # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
python src/build_report.py
```

## Output

The script generates:
- `out/report.pdf` - Complete multi-page PDF report
- `out/figures/` - Individual PNG files for each page

## CSV to Figure Mapping

| CSV File | Figure | Page | Description |
|----------|--------|------|-------------|
| `product_mix_offered.csv` | Fig 1.5 | 10 | Product Mix – Types of Plans Offered |
| `funding.csv` | Fig 1.9 | 12 | Funding Approaches |
| `network.csv` | Fig 1.11 | 13 | Self-funded Network |
| `own_hospital_cost.csv` | Fig 1.12 | 13 | Cost of Services at Own Hospital |
| `monthly_cost_pepm.csv` | Fig 1.13 | 14 | 2022 Medical Cost PEPM by Region |
| `no_cost_ee_only.csv` | Fig 1.14 | 15 | No-cost Plan Prevalence – EE Only |
| `tele_access.csv` | Fig 1.21-1.22 | 21 | Telemedicine & Teletherapy Access |
| `tele_copay_relationship.csv` | Fig 1.21 | 21 | Copay vs PCP Relationship |
| `stop_loss_attachment_points.csv` | Fig 1.24 | 22 | Stop-loss Specific Attachment Points |
| `hdhp_offering.csv` | Fig 1.42 | 34 | HDHP Offering |
| `dental_offerings.csv` | Fig 1.49 | 40 | Dental Options Offered |
| `union_rep.csv` | Fig 1.3 | 9 | Union Representation Mix |
| `appendix_ee_contributions.csv` | Appendix A | 48-49 | EE-Only Contributions (Optional) |

## Adding New Pages

1. Add a CSV file to the `data/` directory
2. Update `build_report.py` to load the CSV and call the appropriate chart helper
3. Use helpers from `charts.py` (bar_chart, table_page) or `pages.py` (text_page)

## Project Structure

```
keenan-rebuild/
├── data/                           # CSV data files
├── src/
│   ├── build_report.py            # Main entry point
│   ├── charts.py                  # Reusable chart helpers
│   └── pages.py                   # Page assembly functions
├── out/
│   ├── report.pdf                 # Final multi-page PDF
│   └── figures/                   # Individual page PNGs
├── README.md
└── requirements.txt
```

## Dependencies

- pandas>=1.5.0
- matplotlib>=3.6.0

No seaborn, no external fonts required.