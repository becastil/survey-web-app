"""
Reusable chart and table helpers for generating matplotlib figures.
"""
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from matplotlib.backends.backend_pdf import PdfPages


def setup_figure(figsize=(10, 8)):
    """Create a new figure with consistent styling."""
    fig, ax = plt.subplots(figsize=figsize)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color('#CCCCCC')
    ax.spines['bottom'].set_color('#CCCCCC')
    ax.grid(True, alpha=0.3, axis='y')
    return fig, ax


def format_value(value, fmt="percent"):
    """Format values for display on charts."""
    if fmt == "percent":
        return f"{value:.1f}%"
    elif fmt == "currency":
        return f"${value:,.0f}"
    elif fmt == "raw":
        return str(value)
    else:
        return str(value)


def bar_chart(df, x_col, y_col, title, ylabel=None, rotation=0, value_fmt="percent", figsize=(10, 8)):
    """
    Create a vertical bar chart with value labels.
    
    Args:
        df: DataFrame with data
        x_col: Column name for x-axis
        y_col: Column name for y-axis values
        title: Chart title
        ylabel: Y-axis label (optional)
        rotation: X-axis label rotation in degrees
        value_fmt: Format for value labels ("percent", "currency", "raw")
        figsize: Figure size tuple
    
    Returns:
        matplotlib Figure object
    """
    fig, ax = setup_figure(figsize)
    
    bars = ax.bar(df[x_col], df[y_col], color='#2E86AB', alpha=0.8)
    
    # Add value labels on bars
    for bar, value in zip(bars, df[y_col]):
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height + 0.5,
                format_value(value, value_fmt),
                ha='center', va='bottom', fontweight='bold', fontsize=10)
    
    ax.set_title(title, fontsize=16, fontweight='bold', pad=20)
    ax.set_xlabel(x_col, fontsize=12, fontweight='bold')
    if ylabel:
        ax.set_ylabel(ylabel, fontsize=12, fontweight='bold')
    
    # Rotate x-axis labels if needed
    if rotation != 0:
        plt.xticks(rotation=rotation, ha='right')
    
    # Adjust y-axis to accommodate labels
    y_max = df[y_col].max()
    ax.set_ylim(0, y_max * 1.15)
    
    plt.tight_layout()
    return fig


def horizontal_bar_chart(df, x_col, y_col, title, xlabel=None, value_fmt="percent", figsize=(10, 8)):
    """
    Create a horizontal bar chart with value labels.
    
    Args:
        df: DataFrame with data
        x_col: Column name for categories (will be y-axis)
        y_col: Column name for values (will be x-axis)
        title: Chart title
        xlabel: X-axis label (optional)
        value_fmt: Format for value labels ("percent", "currency", "raw")
        figsize: Figure size tuple
    
    Returns:
        matplotlib Figure object
    """
    fig, ax = setup_figure(figsize)
    
    bars = ax.barh(df[x_col], df[y_col], color='#A23B72', alpha=0.8)
    
    # Add value labels on bars
    for bar, value in zip(bars, df[y_col]):
        width = bar.get_width()
        ax.text(width + 0.5, bar.get_y() + bar.get_height()/2.,
                format_value(value, value_fmt),
                ha='left', va='center', fontweight='bold', fontsize=10)
    
    ax.set_title(title, fontsize=16, fontweight='bold', pad=20)
    ax.set_ylabel(x_col, fontsize=12, fontweight='bold')
    if xlabel:
        ax.set_xlabel(xlabel, fontsize=12, fontweight='bold')
    
    # Adjust x-axis to accommodate labels
    x_max = df[y_col].max()
    ax.set_xlim(0, x_max * 1.2)
    
    plt.tight_layout()
    return fig


def grouped_bar_chart(df, categories, values, title, ylabel=None, value_fmt="percent", figsize=(12, 8)):
    """
    Create a grouped bar chart for multiple series.
    
    Args:
        df: DataFrame with data
        categories: List of category names
        values: List of value column names
        title: Chart title
        ylabel: Y-axis label (optional)
        value_fmt: Format for value labels ("percent", "currency", "raw")
        figsize: Figure size tuple
    
    Returns:
        matplotlib Figure object
    """
    fig, ax = setup_figure(figsize)
    
    x = np.arange(len(df))
    width = 0.35
    colors = ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D']
    
    for i, col in enumerate(values):
        offset = (i - len(values)/2 + 0.5) * width
        bars = ax.bar(x + offset, df[col], width, label=col, 
                     color=colors[i % len(colors)], alpha=0.8)
        
        # Add value labels
        for bar, value in zip(bars, df[col]):
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height + 0.5,
                    format_value(value, value_fmt),
                    ha='center', va='bottom', fontweight='bold', fontsize=9)
    
    ax.set_title(title, fontsize=16, fontweight='bold', pad=20)
    ax.set_xticks(x)
    ax.set_xticklabels(df[categories[0]])
    if ylabel:
        ax.set_ylabel(ylabel, fontsize=12, fontweight='bold')
    
    ax.legend()
    
    # Adjust y-axis to accommodate labels
    y_max = df[values].values.max()
    ax.set_ylim(0, y_max * 1.15)
    
    plt.tight_layout()
    return fig


def table_page(df, title, figsize=(10, 8)):
    """
    Create a formatted table page.
    
    Args:
        df: DataFrame with table data
        title: Table title
        figsize: Figure size tuple
    
    Returns:
        matplotlib Figure object
    """
    fig, ax = setup_figure(figsize)
    ax.axis('off')
    
    # Create table
    table = ax.table(cellText=df.values,
                    colLabels=df.columns,
                    cellLoc='center',
                    loc='center',
                    bbox=[0.1, 0.1, 0.8, 0.7])
    
    table.auto_set_font_size(False)
    table.set_fontsize(11)
    table.scale(1.2, 1.8)
    
    # Style header row
    for i in range(len(df.columns)):
        table[(0, i)].set_facecolor('#2E86AB')
        table[(0, i)].set_text_props(weight='bold', color='white')
    
    # Style data rows with alternating colors
    for i in range(1, len(df) + 1):
        for j in range(len(df.columns)):
            if i % 2 == 0:
                table[(i, j)].set_facecolor('#F5F5F5')
            else:
                table[(i, j)].set_facecolor('white')
    
    ax.set_title(title, fontsize=16, fontweight='bold', pad=20)
    plt.tight_layout()
    return fig