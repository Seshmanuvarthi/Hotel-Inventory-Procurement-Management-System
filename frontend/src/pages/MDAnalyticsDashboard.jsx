// frontend/src/pages/MDAnalyticsDashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell
} from 'recharts';

import axiosInstance from '../utils/axiosInstance';
import Layout from '../components/Layout';
import DashboardCard from '../components/DashboardCard';
import PrimaryButton from '../components/PrimaryButton';
import StyledTable from '../components/StyledTable';
import StyledForm from '../components/StyledForm';

import {
  TrendingUp, DollarSign, AlertTriangle, BarChart3,
  PieChart, Activity, Bell,
} from 'lucide-react';

const MDAnalyticsDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // STATE VARIABLES
  const [summary, setSummary] = useState({});
  const [leakageChart, setLeakageChart] = useState([]);
  const [hotelLeakage, setHotelLeakage] = useState([]);
  const [procurementVsPayments, setProcurementVsPayments] = useState([]);
  const [itemConsumptionTrend, setItemConsumptionTrend] = useState([]);
  const [expectedVsActualTopItems, setExpectedVsActualTopItems] = useState([]);
  const [vendorPerformance, setVendorPerformance] = useState([]);

  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());

  // USECALLBACK TO FIX ESLINT WARNING
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        summaryRes, leakageRes, hotelLeakageRes, procurementRes,
        expectedVsActualRes, vendorRes
      ] = await Promise.all([
        axiosInstance.get('/md-dashboard/summary'),
        axiosInstance.get('/md-dashboard/leakage-chart'),
        axiosInstance.get('/md-dashboard/hotel-leakage'),
        axiosInstance.get(`/md-dashboard/procurement-vs-payments?year=${year}`),
        axiosInstance.get('/md-dashboard/expected-vs-actual-top-items'),
        axiosInstance.get('/md-dashboard/vendor-performance'),
      ]);

      setSummary(summaryRes.data);
      setLeakageChart(leakageRes.data || []);
      setHotelLeakage(hotelLeakageRes.data || []);
      setProcurementVsPayments(procurementRes.data || []);
      setExpectedVsActualTopItems(expectedVsActualRes.data || []);
      setVendorPerformance(vendorRes.data || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  }, [year]);

  // FETCH ON LOAD
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleDateFilter = async () => {
    try {
      const [
        leakageRes, hotelLeakageRes, expectedVsActualRes, vendorRes
      ] = await Promise.all([
        axiosInstance.get(`/md-dashboard/leakage-chart?from=${fromDate}&to=${toDate}`),
        axiosInstance.get(`/md-dashboard/hotel-leakage?from=${fromDate}&to=${toDate}`),
        axiosInstance.get(`/md-dashboard/expected-vs-actual-top-items?from=${fromDate}&to=${toDate}`),
        axiosInstance.get(`/md-dashboard/vendor-performance?from=${fromDate}&to=${toDate}`),
      ]);

      setLeakageChart(leakageRes.data || []);
      setHotelLeakage(hotelLeakageRes.data || []);
      setExpectedVsActualTopItems(expectedVsActualRes.data || []);
      setVendorPerformance(vendorRes.data || []);
    } catch (error) {
      console.error('Error applying filtered data:', error);
    }
  };

  const handleItemTrend = async () => {
    if (!selectedItem) return;
    try {
      const res = await axiosInstance.get(
        `/md-dashboard/item-consumption-trend?itemId=${selectedItem}&range=daily`
      );
      setItemConsumptionTrend(res.data || []);
    } catch (error) {
      console.error('Error fetching item trend:', error);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const vendorTableHeaders = ['Vendor', 'Total Procured', 'Total Paid', 'Pending'];
  const vendorTableData = vendorPerformance.map(v => [
    v.vendorName,
    `₹${v.totalProcured?.toLocaleString()}`,
    `₹${v.totalPaid?.toLocaleString()}`,
    `₹${v.pendingAmount?.toLocaleString()}`
  ]);

  if (loading) {
    return (
      <Layout title="MD Analytics Dashboard" userRole={user.role}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="MD Analytics Dashboard" userRole={user.role}>
      <div className="space-y-8">

        {/* HEADER */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2 text-text-dark">
            Management Analytics
          </h2>
          <p className="text-accent">Business Intelligence Dashboard</p>
        </div>

        {/* FILTERS */}
        <div className="bg-card rounded-xl p-6 shadow-luxury border border-secondary/10">
          <h3 className="text-xl font-semibold mb-3">Analytics Filters</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StyledForm.Input type="date" label="From" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            <StyledForm.Input type="date" label="To" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            <StyledForm.Input type="number" label="Year" value={year} onChange={(e) => setYear(e.target.value)} />

            <div className="flex items-end">
              <PrimaryButton
                onClick={() => { handleDateFilter(); fetchAllData(); }}
                className="w-full"
              >
                Apply Filters
              </PrimaryButton>
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <DashboardCard title="Procurement" value={`₹${summary.totalProcurementThisMonth?.toLocaleString()}`} icon={DollarSign} color="primary" subtitle="This Month" />
          <DashboardCard title="Payments" value={`₹${summary.totalPaymentsThisMonth?.toLocaleString()}`} icon={TrendingUp} color="secondary" subtitle="This Month" />
          <DashboardCard title="Pending" value={`₹${summary.totalPendingAmount?.toLocaleString()}`} icon={AlertTriangle} color="warning" subtitle="Outstanding" />
          <DashboardCard title="Leakage" value={`${summary.totalLeakagePercentage || 0}%`} icon={Activity} color="accent" subtitle="Percentage" />
          <DashboardCard title="Wastage %" value={`${summary.totalWastagePercentage || 0}%`} icon={BarChart3} color="primary" subtitle="Overall" />
          <DashboardCard title="Sales" value={`₹${summary.totalSalesThisMonth?.toLocaleString()}`} icon={PieChart} color="secondary" subtitle="This Month" />
          <DashboardCard title="Alerts" value={summary.activeAlerts || 0} icon={Bell} color="warning" subtitle="Active" />
        </div>

        {/* CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* PROCUREMENT vs PAYMENTS */}
          <div className="bg-card rounded-xl p-6 shadow-luxury border border-secondary/10">
            <h3 className="text-xl font-semibold mb-4">Procurement vs Payments ({year})</h3>

            {procurementVsPayments.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={procurementVsPayments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="procurement" fill="#8884d8" />
                  <Bar dataKey="payments" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-accent text-center">No data</p>}
          </div>

          {/* LEAKAGE BY ITEM */}
          <div className="bg-card rounded-xl p-6 shadow-luxury border border-secondary/10">
            <h3 className="text-xl font-semibold mb-4">Leakage by Item</h3>

            {leakageChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={leakageChart.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="itemName" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="leakage" fill="#ff7300" name="Leakage %" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-accent text-center">No leakage data</p>}
          </div>

          {/* HOTEL LEAKAGE PIE */}
          <div className="bg-card rounded-xl p-6 shadow-luxury border border-secondary/10">
            <h3 className="text-xl font-semibold mb-4">Hotel Leakage Comparison</h3>

            {hotelLeakage.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={hotelLeakage}
                    cx="50%" cy="50%"
                    outerRadius={80}
                    dataKey="leakage"
                    label={({ hotelName, leakage }) =>
                      `${hotelName}: ${leakage}%`
                    }
                  >
                    {hotelLeakage.map((entry, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : <p className="text-accent text-center">No hotel leakage data</p>}
          </div>

          {/* EXPECTED vs ACTUAL */}
          <div className="bg-card rounded-xl p-6 shadow-luxury border border-secondary/10">
            <h3 className="text-xl font-semibold mb-4">Expected vs Actual (Top 5)</h3>

            {expectedVsActualTopItems.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expectedVsActualTopItems}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="itemName" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="expected" fill="#8884d8" />
                  <Bar dataKey="actual" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-accent text-center">No item data</p>}
          </div>
        </div>

        {/* ITEM CONSUMPTION TREND */}
        <div className="bg-card rounded-xl p-6 shadow-luxury border border-secondary/10">
          <h3 className="text-xl font-semibold mb-4">Item Consumption Trend</h3>

          <div className="flex gap-4 mb-4">
            <StyledForm.Input
              type="text"
              placeholder="Enter Item ID"
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="flex-1"
            />
            <PrimaryButton onClick={handleItemTrend}>Load Trend</PrimaryButton>
          </div>

          {itemConsumptionTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={itemConsumptionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="consumption" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-accent text-center">No trend available</p>}
        </div>

        {/* TABLE — VENDOR PERFORMANCE */}
        <div className="bg-card rounded-xl p-6 shadow-luxury border border-secondary/10">
          <h3 className="text-xl font-semibold mb-6">Vendor Performance</h3>
          <StyledTable headers={vendorTableHeaders} data={vendorTableData} />
        </div>

        {/* ALERTS SECTION */}
        <div className="bg-card rounded-xl p-6 shadow-luxury border border-secondary/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Leakage Alerts</h3>
            <PrimaryButton onClick={() => window.open('/leakage-alerts', '_blank')}>
              View All Alerts
            </PrimaryButton>
          </div>
          <div className="text-center text-accent">
            <Bell className="w-12 h-12 mx-auto mb-2 text-warning" />
            <p>Real-time leakage monitoring and alerts</p>
            <p className="text-sm mt-2">Click "View All Alerts" to manage leakage alerts</p>
          </div>
        </div>

      </div> {/* ✅ CORRECTLY CLOSED MAIN WRAPPER */}

    </Layout>
  );
};

export default MDAnalyticsDashboard;
