"""
Page assembly functions for creating text pages and layouts.
"""
import matplotlib.pyplot as plt
import textwrap


def text_page(title, body_text, figsize=(8.5, 11)):
    """
    Create a text-only page (like executive summary).
    
    Args:
        title: Page title
        body_text: Main text content (can include newlines)
        figsize: Figure size tuple
    
    Returns:
        matplotlib Figure object
    """
    fig, ax = plt.subplots(figsize=figsize)
    ax.axis('off')
    
    # Title
    ax.text(0.5, 0.95, title, transform=ax.transAxes,
            fontsize=20, fontweight='bold', ha='center', va='top')
    
    # Body text with proper wrapping
    wrapped_text = []
    for paragraph in body_text.split('\n\n'):
        if paragraph.strip():
            wrapped_paragraph = textwrap.fill(paragraph.strip(), width=80)
            wrapped_text.append(wrapped_paragraph)
    
    full_text = '\n\n'.join(wrapped_text)
    
    ax.text(0.1, 0.85, full_text, transform=ax.transAxes,
            fontsize=11, ha='left', va='top',
            wrap=True, linespacing=1.5)
    
    plt.tight_layout()
    return fig


def create_executive_summary():
    """
    Create the executive summary page content.
    
    Returns:
        matplotlib Figure object
    """
    title = "Executive Summary"
    
    body_text = """Health Care Benefits Strategy 2022 Survey - Key Findings Recreation

This report recreates key charts and tables from the Keenan & Associates Health Care Benefits Strategy 2022 Survey, providing insights into healthcare benefit trends across organizations.

Key Findings Include:

• Product Mix: PPO plans remain the most popular option at 78.5% adoption, while High Deductible Health Plans (HDHP) have significant presence at 67.8% of organizations.

• Funding Approaches: Self-funded plans dominate at 72.1% of organizations, reflecting a continued trend toward self-insurance for cost control and flexibility.

• Regional Cost Variations: Medical costs per employee per month (PEPM) vary significantly by region, with Bay Area showing highest costs at $758 and Central Valley the lowest at $548.

• Network Preferences: Regional PPO networks are preferred by 48.7% of self-funded organizations, followed by national PPO at 35.9%.

• Telemedicine Adoption: Strong adoption of telemedicine services at 89.3%, with teletherapy access at 67.4%, indicating accelerated digital health adoption.

• Union Representation: 41.3% of surveyed organizations have union representation, influencing benefit design and negotiation processes.

• Dental Benefits: Dental PPO (DPPO) plans are offered by 78.2% of organizations, while dental HMO options are available at 34.6%.

• Stop-Loss Coverage: Most common attachment points fall in the $150k-$199k range (28.4%) and $200k-$249k range (24.7%).

This recreation demonstrates the ability to transform survey data into clear, actionable visual insights for benefits strategy decision-making."""

    return text_page(title, body_text)


def create_cover_page():
    """
    Create a cover page for the report.
    
    Returns:
        matplotlib Figure object
    """
    fig, ax = plt.subplots(figsize=(8.5, 11))
    ax.axis('off')
    
    # Main title
    ax.text(0.5, 0.7, "Health Care Benefits Strategy", transform=ax.transAxes,
            fontsize=24, fontweight='bold', ha='center', va='center')
    
    ax.text(0.5, 0.65, "2022 Survey Recreation", transform=ax.transAxes,
            fontsize=20, fontweight='bold', ha='center', va='center')
    
    # Subtitle
    ax.text(0.5, 0.55, "Key Charts and Tables Recreation", transform=ax.transAxes,
            fontsize=14, ha='center', va='center', style='italic')
    
    # Attribution
    ax.text(0.5, 0.45, "Original Survey by Keenan & Associates", transform=ax.transAxes,
            fontsize=12, ha='center', va='center')
    
    ax.text(0.5, 0.4, "Recreation using pandas and matplotlib", transform=ax.transAxes,
            fontsize=10, ha='center', va='center', style='italic')
    
    # Date
    ax.text(0.5, 0.25, "Generated Report", transform=ax.transAxes,
            fontsize=12, ha='center', va='center')
    
    plt.tight_layout()
    return fig