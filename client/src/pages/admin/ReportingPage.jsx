import React, { useState } from 'react';
import { getReport } from '../../api/apiService';

const ReportingPage = () => {
    const [report, setReport] = useState(null); // Will hold the report data once fetched
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const today = new Date();
    const thirtyDaysAgo = new Date(new Date().setDate(today.getDate() - 30));
    
    const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
    const adminToken = localStorage.getItem('adminToken');

    const handleGenerateReport = async () => {
        if (!startDate || !endDate) {
            setError('Please select both a start and end date.');
            return;
        }
        setLoading(true);
        setError('');
        setReport(null);
        try {
            const { data } = await getReport(adminToken, startDate, endDate);
            setReport(data);
        } catch (err) {
            setError('Failed to generate report. ' + (err.response?.data?.message || ''));
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="container">
            <div className="main-content">
                <h1>Reporting</h1>
                <div className="card">
                    <h2>Select Reporting Period</h2>
                    <div className="report-controls">
                        <div className="form-group">
                            <label>Start Date</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>End Date</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                        <button className="btn btn-primary" onClick={handleGenerateReport} disabled={loading}>
                            {loading ? 'Generating...' : 'Generate Report'}
                        </button>
                    </div>
                </div>

                {error && <p className="message message-error">{error}</p>}

                <div className="card">
                    <h2>
                        {report ? `Report for ${startDate} to ${endDate}`: 'Current & Last 30 Days Overview'}
                    </h2>
                    <div className="report-stats">
                        <div className="stat-card">
                            <h3>Total Revenue</h3>
                            <p className="stat-value">${report ? report.totalRevenue : '0.00'}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Occupancy Rate</h3>
                            <p className="stat-value">{report ? report.occupancyRate : '0.0'}%</p>
                        </div>
                        <div className="stat-card">
                            <h3>Total Check-outs</h3>
                            <p className="stat-value">{report ? report.totalBookings : 0}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Rooms Under Maintenance</h3>
                            <p className="stat-value">{report ? report.maintenanceCount : 0}</p>
                        </div>
                    </div>
                    {report && (
                        <div style={{marginTop: '30px'}}>
                            <h3>Most Popular Services</h3>
                            {report.popularServices.length > 0 ? (
                                <ul>
                                    {report.popularServices.map(service => (
                                        <li key={service._id}>{service._id} (Ordered {service.count} times)</li>
                                    ))}
                                </ul>
                            ) : <p>No room services were ordered in this period.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportingPage;