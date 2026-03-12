import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import API from '../../services/api';

const Enrollments = () => {
  const [requests, setRequests] = useState([]);

  // Pagination & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchRequests = async () => {
    try {
      const { data } = await API.get('/admin/users/enrollments');
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) { 
      console.error("Fetch requests error:", error); 
      setRequests([]);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (userId, itemId, action, type) => {
    try {
      let endpoint = '';
      let payload = { userId };

      if (type === 'pathway') {
        endpoint = `/admin/users/enrollments/pathway/${action}`;
        payload.pathwayId = itemId;
      } else if (type === 'class') {
        endpoint = `/admin/users/enrollments/class/${action}`;
        payload.classId = itemId;
      } else {
        endpoint = `/admin/users/enrollments/${action}`;
        payload.courseId = itemId;
      }
      
      await API.post(endpoint, payload);
      alert(`ดำเนินการ ${action === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'} ${type.toUpperCase()} เรียบร้อยแล้ว`);
      fetchRequests();
    } catch (error) { 
      alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message)); 
    }
  };

  // Filter and Paginate Data
  const filteredRequests = requests.filter(req => 
    (req.userName && req.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (req.userEmail && req.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (req.itemTitle && req.itemTitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <AdminLayout>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0' }}>คำขอลงทะเบียน</h1>
        <p style={{ color: 'var(--conicle-text-muted)', margin: 0 }}>อนุมัติการลงทะเบียนรายคอร์สหรือเส้นทางการเรียนรู้</p>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="ค้นหาตามชื่อผู้เรียน, อีเมล หรือชื่อคอร์ส/เส้นทาง..." 
          className="form-control" 
          style={{ maxWidth: '400px' }}
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
      </div>
      
      <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '16px', backgroundColor: '#f9fafb', color: 'var(--conicle-text-muted)', fontWeight: '600', fontSize: '0.85rem', borderBottom: '1px solid var(--conicle-border)' }}>ประเภท</th>
              <th style={{ textAlign: 'left', padding: '16px', backgroundColor: '#f9fafb', color: 'var(--conicle-text-muted)', fontWeight: '600', fontSize: '0.85rem', borderBottom: '1px solid var(--conicle-border)' }}>ชื่อผู้เรียน</th>
              <th style={{ textAlign: 'left', padding: '16px', backgroundColor: '#f9fafb', color: 'var(--conicle-text-muted)', fontWeight: '600', fontSize: '0.85rem', borderBottom: '1px solid var(--conicle-border)' }}>คอร์ส / เส้นทางที่สมัคร</th>
              <th style={{ textAlign: 'right', padding: '16px', backgroundColor: '#f9fafb', color: 'var(--conicle-text-muted)', fontWeight: '600', fontSize: '0.85rem', borderBottom: '1px solid var(--conicle-border)' }}>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '60px', textAlign: 'center', color: 'var(--conicle-text-muted)', fontSize: '0.9rem' }}>{searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ไม่พบคำขอที่รอกระบวนการ'}</td></tr>
            ) : (
              currentItems.map((req, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '6px', 
                      fontSize: '0.65rem', 
                      fontWeight: '700',
                      backgroundColor: req.type === 'pathway' ? 'var(--conicle-red)' : (req.type === 'class' ? '#3b82f6' : '#f3f4f6'),
                      color: (req.type === 'pathway' || req.type === 'class') ? 'white' : '#4b5563'
                    }}>
                      {req.type === 'pathway' ? 'เส้นทาง' : (req.type === 'class' ? 'คลาส' : 'คอร์ส')}
                    </span>
                  </td>
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)' }}>
                    <div style={{ fontWeight: '600' }}>{req.userName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--conicle-text-muted)' }}>{req.userEmail}</div>
                  </td>
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)' }}>
                    <div style={{ fontWeight: '600' }}>{req.itemTitle}</div>
                    {req.type === 'pathway' && <div style={{ fontSize: '0.75rem', color: 'var(--conicle-red)', marginTop: '4px', fontWeight: '600' }}>ปลดล็อก {req.courseCount} คอร์ส</div>}
                  </td>
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--conicle-border)', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleAction(req.userId, req.itemId, 'approve', req.type)} 
                      className="btn btn-primary" 
                      style={{ marginRight: '8px', fontSize: '0.75rem', padding: '8px 16px' }}
                    >
                      {req.type === 'pathway' ? 'อนุมัติทั้งหมด' : 'อนุมัติ'}
                    </button>
                    <button 
                      onClick={() => handleAction(req.userId, req.itemId, 'reject', req.type)} 
                      className="btn btn-outline" 
                      style={{ fontSize: '0.75rem', padding: '8px 16px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                    >
                      ปฏิเสธ
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '24px', gap: '10px' }}>
          <button 
            className="btn btn-outline" 
            style={{ padding: '8px 16px', fontSize: '0.85rem' }} 
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            ก่อนหน้า
          </button>
          <div style={{ display: 'flex', gap: '5px' }}>
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i} 
                className={`btn ${currentPage === i + 1 ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                onClick={() => goToPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button 
            className="btn btn-outline" 
            style={{ padding: '8px 16px', fontSize: '0.85rem' }} 
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            ถัดไป
          </button>
        </div>
      )}
    </AdminLayout>
  );
};

export default Enrollments;
