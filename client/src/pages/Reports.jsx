import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import {
  HiOutlineChartPie,
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineTrendingUp,
} from 'react-icons/hi';
import './Reports.css';

const Reports = () => {
  const [categories, setCategories] = useState([]);
  const [ageing, setAgeing] = useState(null);
  const [staffPerformance, setStaffPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const [catRes, ageRes, perfRes] = await Promise.all([
        dashboardAPI.getCategories(),
        dashboardAPI.getAgeing(),
        dashboardAPI.getStaffPerformance(),
      ]);
      setCategories(catRes.data.data);
      setAgeing(ageRes.data.data);
      setStaffPerformance(perfRes.data.data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryEmoji = (cat) => {
    const emojis = {
      fees: '💰', attendance: '📋', id_card: '🪪', documents: '📄',
      certificates: '🎓', hostel: '🏠', library: '📚', exam: '📝', other: '📌',
    };
    return emojis[cat] || '📌';
  };

  const totalCategoryTickets = categories.reduce((sum, c) => sum + c.count, 0) || 1;
  const totalAgeing = ageing ? Object.values(ageing).reduce((a, b) => a + b, 0) : 0;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading__spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="reports-page animate-fade-in">
      <div className="reports-page__header">
        <h2>Reports & Analytics</h2>
        <p>Comprehensive overview of ticket performance and trends</p>
      </div>

      <div className="reports-grid">
        {/* Category Breakdown */}
        <div className="report-card animate-fade-in-up stagger-1" style={{ opacity: 0 }}>
          <div className="report-card__header">
            <HiOutlineChartPie className="report-card__icon" />
            <h3>Category Breakdown</h3>
          </div>
          <div className="report-card__body">
            {categories.length > 0 ? (
              <div className="category-bars">
                {categories.map((cat) => {
                  const percentage = Math.round((cat.count / totalCategoryTickets) * 100);
                  return (
                    <div key={cat._id} className="category-bar">
                      <div className="category-bar__header">
                        <span className="category-bar__label">
                          {getCategoryEmoji(cat._id)} {cat._id?.replace('_', ' ')}
                        </span>
                        <span className="category-bar__count">{cat.count} tickets</span>
                      </div>
                      <div className="category-bar__track">
                        <div
                          className="category-bar__fill"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="category-bar__stats">
                        <span className="category-bar__open">{cat.open} open</span>
                        <span className="category-bar__resolved">{cat.resolved} resolved</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="report-card__empty">No data available</p>
            )}
          </div>
        </div>

        {/* Ageing Report */}
        <div className="report-card animate-fade-in-up stagger-2" style={{ opacity: 0 }}>
          <div className="report-card__header">
            <HiOutlineClock className="report-card__icon" />
            <h3>Ticket Ageing</h3>
          </div>
          <div className="report-card__body">
            {ageing && totalAgeing > 0 ? (
              <div className="ageing-chart">
                <div className="ageing-donut">
                  <div className="ageing-donut__center">
                    <span className="ageing-donut__total">{totalAgeing}</span>
                    <span className="ageing-donut__label">Active</span>
                  </div>
                </div>
                <div className="ageing-legend">
                  <div className="ageing-legend__item">
                    <span className="ageing-dot ageing-dot--fresh"></span>
                    <span className="ageing-legend__label">Fresh (&lt;24h)</span>
                    <span className="ageing-legend__count">{ageing.fresh}</span>
                  </div>
                  <div className="ageing-legend__item">
                    <span className="ageing-dot ageing-dot--normal"></span>
                    <span className="ageing-legend__label">Normal (1-3d)</span>
                    <span className="ageing-legend__count">{ageing.normal}</span>
                  </div>
                  <div className="ageing-legend__item">
                    <span className="ageing-dot ageing-dot--ageing"></span>
                    <span className="ageing-legend__label">Ageing (3-7d)</span>
                    <span className="ageing-legend__count">{ageing.ageing}</span>
                  </div>
                  <div className="ageing-legend__item">
                    <span className="ageing-dot ageing-dot--critical"></span>
                    <span className="ageing-legend__label">Critical (7d+)</span>
                    <span className="ageing-legend__count">{ageing.critical}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="report-card__empty">No active tickets</p>
            )}
          </div>
        </div>

        {/* Staff Performance */}
        <div className="report-card report-card--full animate-fade-in-up stagger-3" style={{ opacity: 0 }}>
          <div className="report-card__header">
            <HiOutlineUserGroup className="report-card__icon" />
            <h3>Staff Performance</h3>
          </div>
          <div className="report-card__body">
            {staffPerformance.length > 0 ? (
              <div className="staff-table-wrap">
                <table className="staff-table">
                  <thead>
                    <tr>
                      <th>Staff</th>
                      <th>Assigned</th>
                      <th>Resolved</th>
                      <th>Open</th>
                      <th>SLA Breach</th>
                      <th>Resolution Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffPerformance.map((staff) => (
                      <tr key={staff._id}>
                        <td>
                          <div className="staff-cell">
                            <div className="staff-cell__avatar">{staff.name?.charAt(0)}</div>
                            <div>
                              <p className="staff-cell__name">{staff.name}</p>
                              <p className="staff-cell__dept">{staff.department}</p>
                            </div>
                          </div>
                        </td>
                        <td><span className="staff-stat">{staff.totalAssigned}</span></td>
                        <td><span className="staff-stat staff-stat--green">{staff.resolved}</span></td>
                        <td><span className="staff-stat staff-stat--blue">{staff.open}</span></td>
                        <td><span className="staff-stat staff-stat--red">{staff.slaBreached}</span></td>
                        <td>
                          <div className="resolution-bar">
                            <div className="resolution-bar__track">
                              <div
                                className="resolution-bar__fill"
                                style={{ width: `${staff.resolutionRate}%` }}
                              ></div>
                            </div>
                            <span className="resolution-bar__pct">{staff.resolutionRate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="report-card__empty">No staff data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
