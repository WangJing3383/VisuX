import os
import tempfile
import pandas as pd
import numpy as np
from django.test import TestCase
from backend.api.models import UploadedFile
from backend.server_handler.engine import Engine

class EngineTest(TestCase):
    def setUp(self):
        self.sample_data = pd.DataFrame({
            "feature1": [1, 2, 3, 4, 5],
            "feature2": [2, 4, 6, 8, 10],
            "feature3": [5, 3, 1, 3, 5]
        })

    def test_apply_pca(self):
        """Test PCA dimensionality reduction"""
        result = Engine.apply_pca(self.sample_data, n_components=2)
        self.assertEqual(result.shape[1], 2)  # Check number of components
        self.assertEqual(result.shape[0], self.sample_data.shape[0])  # Check rows match

    def test_apply_umap(self):
        """Test UMAP dimensionality reduction"""
        result = Engine.apply_umap(self.sample_data, n_components=2)
        self.assertEqual(result.shape[1], 2)
        self.assertEqual(result.shape[0], self.sample_data.shape[0])

    def test_dimensional_reduction(self):
        """Test general dimensionality reduction function"""
        pca_result = Engine.dimensional_reduction(self.sample_data, method="pca", n_components=2)
        self.assertEqual(pca_result.shape[1], 2)

    def test_compute_correlation(self):
        """Test correlation computation"""
        correlation = Engine.compute_correlation(self.sample_data, "feature1", "feature2", method="pearson")
        self.assertAlmostEqual(correlation, 1.0, places=2)  # feature2 is a perfect linear transformation of feature1

    def test_invalid_correlation_method(self):
        """Test invalid correlation method handling"""
        with self.assertRaises(ValueError):
            Engine.compute_correlation(self.sample_data, "feature1", "feature2", method="invalid_method")

    def test_fit_curve_polynomial(self):
        """Test curve fitting with polynomial method"""
        params, covariance, fitted_data = Engine.fit_curve(self.sample_data, "feature1", "feature2", method="polynomial", degree=2)
        self.assertIsNotNone(params)
        self.assertIsInstance(fitted_data, pd.DataFrame)

    def test_fit_curve_linear(self):
        """Test curve fitting with linear method"""
        params, covariance, fitted_data = Engine.fit_curve(self.sample_data, "feature1", "feature2", method="linear")
        self.assertIsNotNone(params)
        self.assertIsInstance(fitted_data, pd.DataFrame)

    def test_fit_curve_exponential(self):
        """Test curve fitting with exponential method"""
        params, covariance, fitted_data = Engine.fit_curve(self.sample_data, "feature1", "feature2", method="exponential")
        self.assertIsNotNone(params)
        self.assertIsInstance(fitted_data, pd.DataFrame)

    def test_interpolation_linear(self):
        """Test interpolation using linear method"""
        interpolated_data = Engine.interpolate(
            self.sample_data, 
            x_feature="feature1", 
            y_feature="feature2", 
            kind="linear", 
            num_points=10
        )
        self.assertIsInstance(interpolated_data, pd.DataFrame)
        self.assertEqual(len(interpolated_data), 10)

    def test_interpolation_polynomial(self):
        """Test interpolation using polynomial method"""
        interpolated_data = Engine.interpolate(
            self.sample_data, 
            x_feature="feature1", 
            y_feature="feature2", 
            kind="polynomial", 
            num_points=10, 
            degree=2
        )
        self.assertIsInstance(interpolated_data, pd.DataFrame)
        self.assertEqual(len(interpolated_data), 10)

    def test_interpolation_exponential(self):
        """Test interpolation using exponential method"""
        interpolated_data = Engine.interpolate(
            self.sample_data, 
            x_feature="feature1", 
            y_feature="feature2", 
            kind="exponential", 
            num_points=10
        )
        self.assertIsInstance(interpolated_data, pd.DataFrame)
        self.assertEqual(len(interpolated_data), 10)

    def test_extrapolation_linear(self):
        """Test extrapolation using linear method"""
        target_x = [6, 7, 8]
        extrapolated_data = Engine.extrapolate(
            self.sample_data, 
            x_feature="feature1", 
            y_feature="feature2", 
            target_x=target_x, 
            method="linear"
        )
        self.assertIsInstance(extrapolated_data, pd.DataFrame)
        self.assertEqual(len(extrapolated_data), len(target_x))

    def test_extrapolation_polynomial(self):
        """Test extrapolation using polynomial method"""
        target_x = [6, 7, 8]
        extrapolated_data = Engine.extrapolate(
            self.sample_data, 
            x_feature="feature1", 
            y_feature="feature2", 
            target_x=target_x, 
            method="polynomial", 
            degree=2
        )
        self.assertIsInstance(extrapolated_data, pd.DataFrame)
        self.assertEqual(len(extrapolated_data), len(target_x))

    def test_extrapolation_exponential(self):
        """Test extrapolation using exponential method"""
        target_x = [6, 7, 8]
        extrapolated_data = Engine.extrapolate(
            self.sample_data, 
            x_feature="feature1", 
            y_feature="feature2", 
            target_x=target_x, 
            method="exponential"
        )
        self.assertIsInstance(extrapolated_data, pd.DataFrame)
        self.assertEqual(len(extrapolated_data), len(target_x))
