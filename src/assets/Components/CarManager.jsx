import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { getCars, createCar, updateCar, deleteCar } from '../api/carApi';
import { getCateCars } from '../api/cateCarApi';
import { getRepairContents } from '../api/repairContentApi';
import { getProducts } from '../api/productApi';
import { getSolutions } from '../api/solutionApi';
import { getStatuses } from '../api/statusApi';
import exportToExcel from './exportToExcel';

function getTaxSummary(cars, products) {
  let all8PreTax = 0, all8PostTax = 0, all10PreTax = 0, all10PostTax = 0;
  function calculateTotalAfterTax(price, taxPercent = 0, quantity = 1) {
    return price * quantity * (1 + taxPercent / 100);
  }
  cars.forEach(car => {
    (car.repairContents || []).forEach(rc => {
      const rcProducts = rc.products || [];
      rcProducts.forEach(p => {
        const prod = products.find(pr => pr._id === (p.product._id || p.product));
        if (prod) {
          const preTax = prod.price * p.quantity;
          const postTax = calculateTotalAfterTax(prod.price, prod.tax, p.quantity);
          if (prod.tax === 8) {
            all8PreTax += preTax;
            all8PostTax += postTax;
          } else if (prod.tax === 10) {
            all10PreTax += preTax;
            all10PostTax += postTax;
          }
        }
      });
      if (rcProducts.length === 0 && rc.servicePrice) {
        all8PreTax += rc.servicePrice;
        all8PostTax += calculateTotalAfterTax(rc.servicePrice, 8, 1);
      }
    });
  });
  const allVat8 = all8PostTax - all8PreTax;
  const allVat10 = all10PostTax - all10PreTax;
  const allPreTax = all8PreTax + all10PreTax;
  const allVat = allVat8 + allVat10;
  const allPostTax = all8PostTax + all10PostTax;
  return {
    all8PreTax, all10PreTax, allPreTax,
    allVat8, allVat10, allVat,
    all8PostTax, all10PostTax, allPostTax
  };
}

function formatMoney(num) {
  return num ? num.toLocaleString('vi-VN') + 'đ' : '0đ';
}

function CarManager() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('form');
  const [cars, setCars] = useState([]);
  const [cateCars, setCateCars] = useState([]);
  const [repairContents, setRepairContents] = useState([]);
  const [products, setProducts] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [searchPlate, setSearchPlate] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    plateNumber: '',
    carType: '',
    repairContents: [],
  });
  const [expandedCarIds, setExpandedCarIds] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const calculateTotalAfterTax = (price, tax, quantity) => {
    const p = parseFloat(price || 0);
    const t = parseFloat(tax || 0);
    const q = parseInt(quantity || 1);
    return p * q * (1 + t / 100);
  };

  const calculateCarTotal = (car) => {
    let total = 0;

    car.repairContents?.forEach(rc => {
      const hasProducts = Array.isArray(rc.products) && rc.products.length > 0;

      if (hasProducts) {
        rc.products.forEach(p => {
          const productDetail = products.find(prod => prod._id === (p.product._id || p.product));
          if (productDetail) {
            total += calculateTotalAfterTax(productDetail.price, productDetail.tax, p.quantity);
          }
        });
      } else if (rc.servicePrice) {
        total += calculateServiceAfterTax(rc.servicePrice);
      }
    });

    return total;
  };

  useEffect(() => {
    const fetchRepairContents = async () => {
      const res = await getRepairContents();
      setRepairContents(res.data);
    };
    fetchRepairContents();
  }, []);
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [carRes, cateCarRes, repairContentRes, productRes, statusRes, solutionRes] = await Promise.all([
        getCars(),
        getCateCars(),
        getRepairContents(),
        getProducts(),
        getStatuses(),
        getSolutions()
      ]);
      setCars(carRes.data);
      setCateCars(cateCarRes.data);
      setRepairContents(repairContentRes.data);
      setProducts(productRes.data);
      setStatuses(statusRes.data);
      setSolutions(solutionRes.data);
    } catch (error) {
      console.error('Lỗi khi load dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSolutionToProduct = (rcIndex, pIndex) => {
    const newRepairContents = [...form.repairContents];
    if (!newRepairContents[rcIndex].products[pIndex].solutions) {
      newRepairContents[rcIndex].products[pIndex].solutions = [];
    }
    newRepairContents[rcIndex].products[pIndex].solutions.push('');
    setForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };

  const handleSolutionChange = (rcIndex, pIndex, sIndex, value) => {
    const newRepairContents = [...form.repairContents];
    newRepairContents[rcIndex].products[pIndex].solutions[sIndex] = value;
    setForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };

  const removeSolutionFromProduct = (rcIndex, pIndex, sIndex) => {
    const newRepairContents = [...form.repairContents];
    newRepairContents[rcIndex].products[pIndex].solutions.splice(sIndex, 1);
    setForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };
  const calculateServiceAfterTax = (price, taxPercent = 8) => {
    return price ? price * (1 + taxPercent / 100) : 0;
  };
  const addEditingSolutionToProduct = (rcIndex, pIndex) => {
    const newRepairContents = [...form.repairContents];
    if (!newRepairContents[rcIndex].products[pIndex].solutions) {
      newRepairContents[rcIndex].products[pIndex].solutions = [];
    }
    newRepairContents[rcIndex].products[pIndex].solutions.push('');
    setForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };

  const handleEditingSolutionChange = (rcIndex, pIndex, sIndex, value) => {
    const newRepairContents = [...form.repairContents];
    newRepairContents[rcIndex].products[pIndex].solutions[sIndex] = value;
    setForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };

  const removeEditingSolutionFromProduct = (rcIndex, pIndex, sIndex) => {
    const newRepairContents = [...form.repairContents];
    newRepairContents[rcIndex].products[pIndex].solutions.splice(sIndex, 1);
    setForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };

  const addStatusToProduct = (rcIndex, pIndex) => {
    const newRepairContents = [...form.repairContents];
    if (!newRepairContents[rcIndex].products[pIndex].statuses) {
      newRepairContents[rcIndex].products[pIndex].statuses = [];
    }
    newRepairContents[rcIndex].products[pIndex].statuses.push('');
    setForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };

  const handleStatusChange = (rcIndex, pIndex, sIndex, value) => {
    const newRepairContents = [...form.repairContents];
    newRepairContents[rcIndex].products[pIndex].statuses[sIndex] = value;
    setForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };

  const removeStatusFromProduct = (rcIndex, pIndex, sIndex) => {
    const newRepairContents = [...form.repairContents];
    newRepairContents[rcIndex].products[pIndex].statuses.splice(sIndex, 1);
    setForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };

  const addEditingStatusToProduct = (rcIndex, pIndex) => {
    const newRepairContents = [...form.repairContents];
    if (!newRepairContents[rcIndex].products[pIndex].statuses) {
      newRepairContents[rcIndex].products[pIndex].statuses = [];
    }
    newRepairContents[rcIndex].products[pIndex].statuses.push('');
    setForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };

  const handleEditingStatusChange = (rcIndex, pIndex, sIndex, value) => {
    const newRepairContents = [...form.repairContents];
    newRepairContents[rcIndex].products[pIndex].statuses[sIndex] = value;
    setForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };

  const removeEditingStatusFromProduct = (rcIndex, pIndex, sIndex) => {
    const newRepairContents = [...form.repairContents];
    newRepairContents[rcIndex].products[pIndex].statuses.splice(sIndex, 1);
    setForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const addRepairContent = () => {
    setForm(prev => ({
      ...prev,
      repairContents: [...prev.repairContents, { repairContent: '', products: [] }]
    }));
  };

  const handleRepairContentChange = (index, value) => {
    const selected = repairContents.find(r => r._id === value);
    const newRepairContents = [...form.repairContents];

    newRepairContents[index] = {
      repairContent: value,
      name: selected?.name || '',
      servicePrice: selected?.name === 'Công' ? 0 : undefined,
      products: selected?.name === 'Công' ? [] : [],
    };

    setForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };
  const handleServicePriceChange = (rcIndex, value, isEditing = false) => {
    const parsedValue = value === '' ? '' : Number(value);
    if (isEditing) {
      const updated = [...form.repairContents];
      updated[rcIndex] = {
        ...updated[rcIndex],
        servicePrice: parsedValue,
      };
      setForm(prev => ({ ...prev, repairContents: updated }));
    } else {
      const updated = [...form.repairContents];
      updated[rcIndex] = {
        ...updated[rcIndex],
        servicePrice: parsedValue,
      };
      setForm(prev => ({ ...prev, repairContents: updated }));
    }
  };

  const addProductToRepairContent = (rcIndex) => {
    const newRepairContents = [...form.repairContents];
    newRepairContents[rcIndex].products.push({ product: '', quantity: 1, statuses: [], solutions: [] });
    setForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };

  const handleProductChange = (rcIndex, pIndex, field, value) => {
    const newRepairContents = [...form.repairContents];
    newRepairContents[rcIndex].products[pIndex][field] = value;
    setForm(prev => ({ ...prev, repairContents: newRepairContents }));

    if (field === 'product') {
      const productId = value;
      setSelectedProductIds(prevIds => {
        // Loại bỏ id cũ nếu có (trường hợp sửa đổi product)
        const oldProductId = form.repairContents[rcIndex]?.products[pIndex]?.product;
        let newIds = prevIds.filter(id => id !== oldProductId);

        // Nếu id mới chưa có trong danh sách thì thêm vào
        if (productId && !newIds.includes(productId)) {
          newIds.push(productId);
        }

        return newIds;
      });
    }
  };

  // Xóa product khỏi repairContent
  const removeProduct = (rcIndex, pIndex) => {
    const newRepairContents = [...form.repairContents];
    const removedProduct = newRepairContents[rcIndex].products[pIndex];
    newRepairContents[rcIndex].products.splice(pIndex, 1);
    setForm(prev => ({ ...prev, repairContents: newRepairContents }));

    if (removedProduct?.product) {
      setSelectedProductIds(prevIds => prevIds.filter(id => id !== removedProduct.product));
    }
  };

  // Xóa repairContent khỏi form
  const removeRepairContent = (rcIndex) => {
    const newRepairContents = [...form.repairContents];
    newRepairContents.splice(rcIndex, 1);
    setForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateCar(form._id, form);
      } else {
        await createCar(form);
      }
      resetForm();
      fetchAllData();
      setActiveTab('list');
    } catch (error) {
      console.error('Lỗi:', error);
    }
  };

  const resetForm = () => {
    setForm({
      plateNumber: '',
      carType: '',
      repairContents: [],
    });
    setIsEditing(false);
  };

  const handleEdit = (car) => {
    setIsEditing(true);
    setForm({
      _id: car._id,
      plateNumber: car.plateNumber,
      carType: car.carType._id,
      repairContents: car.repairContents.map(rc => ({
        repairContent: rc.repairContent,
        servicePrice: rc.servicePrice ?? '',
        products: rc.products.map(p => ({
          product: p.product._id,
          quantity: p.quantity,
          statuses: (p.statuses || []).map(status => status._id),
          solutions: (p.solutions || []).map(solution => solution._id),
        }))
      })),
    });
    setActiveTab('form');
  };

  const toggleCarExpand = (carId) => {
    setExpandedCarIds(prev =>
      prev.includes(carId) ? prev.filter(id => id !== carId) : [...prev, carId]
    );
  };

  const taxSummary = getTaxSummary(cars, products);

  // Thêm hàm mở dialog xác nhận
  const openDeleteDialog = (carId) => {
    setConfirmDeleteId(carId);
    setShowDeleteDialog(true);
  };
  // Thêm hàm đóng dialog xác nhận
  const closeDeleteDialog = () => {
    setConfirmDeleteId(null);
    setShowDeleteDialog(false);
  };

  // Hàm xóa xe
  const handleDelete = async (carId) => {
    try {
      await deleteCar(carId);
      await fetchAllData();
      // Có thể thêm thông báo thành công ở đây nếu muốn
    } catch (error) {
      console.error('Lỗi khi xóa xe:', error);
      // Có thể thêm thông báo lỗi ở đây nếu muốn
    }
  };

  return (
    <div className="car-manager">
      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <>
      <div className="header">
        <h2>Quản lý Xe</h2>
        <div className="actions">
          <input
            type="text"
            placeholder="🔍 Tìm theo biển số..."
            value={searchPlate}
            onChange={(e) => {
              setSearchPlate(e.target.value);
              if (activeTab !== 'list') setActiveTab('list');
            }}
            className="search-input"
          />
          <button
            onClick={() => {
              const filteredCars = cars.filter(car =>
                car.plateNumber.toLowerCase().includes(searchPlate.toLowerCase())
              );
              const carsToExport = searchPlate.trim() ? filteredCars : cars;
              exportToExcel(carsToExport, repairContents, products);
            }}
            className="export-btn"
          >
            📥 Xuất Excel
          </button>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          {isEditing ? '🛠️ Sửa xe' : '🛠️ Thêm xe mới'}
        </button>
        <button 
          className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          📋 Danh sách xe
        </button>
        <button
          className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          📊 Tổng hợp
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'form' && (
          <form onSubmit={handleSubmit} className="car-form">
            <div className="form-header">
              <h3>{isEditing ? '🛠️ Sửa xe' : '🛠️ Thêm xe mới'}</h3>
              {isEditing && (
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Huỷ
                </button>
              )}
            </div>

            <div className="form-group">
              <label>Biển số:</label>
              <input
                name="plateNumber"
                value={form.plateNumber}
                onChange={handleFormChange}
                required
                placeholder="VD: 51A-12345"
              />
            </div>

            <div className="form-group">
              <label>Loại xe:</label>
              <select
                name="carType"
                value={form.carType}
                onChange={handleFormChange}
                required
              >
                <option value="">-- Chọn loại xe --</option>
                {cateCars.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="repair-contents">
              <label>Nội dung sửa chữa:</label>
              {form.repairContents.map((rc, rcIndex) => {
                const selectedRepairContent = repairContents.find(r => r._id === rc.repairContent);
                const isCong = selectedRepairContent?.name?.toLowerCase() === 'công';

                return (
                  <div key={rcIndex} className="repair-content-item">
                    <Select
                      value={repairContents.find(r => r._id === rc.repairContent) || null}
                      onChange={selected => handleRepairContentChange(rcIndex, selected?._id || '')}
                      options={repairContents}
                      getOptionLabel={option => option.name}
                      getOptionValue={option => option._id}
                      placeholder="-- Chọn nội dung sửa chữa --"
                      isClearable
                    />

                    {isCong ? (
                      <div className="service-price">
                        <label>Tiền công:</label>
                        <input
                          type="text"
                          value={rc.servicePrice !== undefined && rc.servicePrice !== null
                            ? rc.servicePrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                            : ''
                          }
                          onChange={e => {
                            const rawValue = e.target.value;
                            const numericValue = rawValue.replace(/\./g, '');
                            if (/^\d*$/.test(numericValue)) {
                              handleServicePriceChange(rcIndex, numericValue === '' ? 0 : Number(numericValue));
                            }
                          }}
                          required
                          placeholder="Nhập tiền công"
                        />
                        {rc.servicePrice && (
                          <div className="price-details">
                            <p>Thuế (8%): <strong>{(rc.servicePrice * 0.08).toLocaleString('vi-VN')} đ</strong></p>
                            <p>Tổng tiền sau thuế: <strong>{(rc.servicePrice * 1.08).toLocaleString('vi-VN')} đ</strong></p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="products-list">
                        {rc.products.map((p, pIndex) => (
                          <div key={pIndex} className="product-item">
                            <div className="product-header">
                              <Select
                                value={products.find(prod => prod._id === p.product) || null}
                                onChange={selected => handleProductChange(rcIndex, pIndex, 'product', selected?._id || '')}
                                options={products}
                                getOptionLabel={option => option.code}
                                getOptionValue={option => option._id}
                                placeholder="-- Chọn sản phẩm --"
                                isClearable
                              />
                              <input
                                type="number"
                                min={1}
                                value={p.quantity}
                                onChange={e => handleProductChange(rcIndex, pIndex, 'quantity', +e.target.value)}
                                required
                              />
                              <button type="button" onClick={() => removeProduct(rcIndex, pIndex)} className="remove-btn">
                                ❌
                              </button>
                            </div>

                            <div className="product-details">
                              <div className="statuses">
                                {p.statuses?.map((stt, stIndex) => (
                                  <div key={stIndex} className="status-item">
                                    <Select
                                      value={statuses.find(opt => opt._id === stt) || null}
                                      onChange={selected => handleStatusChange(rcIndex, pIndex, stIndex, selected?._id || '')}
                                      options={statuses}
                                      getOptionLabel={opt => opt.name}
                                      getOptionValue={opt => opt._id}
                                      placeholder="-- Chọn trạng thái --"
                                      isClearable
                                    />
                                    <button type="button" onClick={() => removeStatusFromProduct(rcIndex, pIndex, stIndex)} className="remove-btn">
                                      ❌
                                    </button>
                                  </div>
                                ))}
                                <button type="button" onClick={() => addStatusToProduct(rcIndex, pIndex)} className="add-btn">
                                  ⊕ Trạng thái
                                </button>
                              </div>

                              <div className="solutions">
                                {p.solutions?.map((sol, sIndex) => (
                                  <div key={sIndex} className="solution-item">
                                    <Select
                                      value={solutions.find(opt => opt._id === sol) || null}
                                      onChange={selected => handleSolutionChange(rcIndex, pIndex, sIndex, selected?._id || '')}
                                      options={solutions}
                                      getOptionLabel={opt => opt.name}
                                      getOptionValue={opt => opt._id}
                                      placeholder="-- Chọn giải pháp --"
                                      isClearable
                                    />
                                    <button type="button" onClick={() => removeSolutionFromProduct(rcIndex, pIndex, sIndex)} className="remove-btn">
                                      ❌
                                    </button>
                                  </div>
                                ))}
                                <button type="button" onClick={() => addSolutionToProduct(rcIndex, pIndex)} className="add-btn">
                                  🧩 Giải pháp
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        <button type="button" onClick={() => addProductToRepairContent(rcIndex)} className="add-btn">
                          🆕 Thêm sản phẩm
                        </button>
                      </div>
                    )}
                    <button type="button" onClick={() => removeRepairContent(rcIndex)} className="remove-btn">
                      ❌ Xoá nội dung sửa chữa
                    </button>
                  </div>
                );
              })}
              <button type="button" onClick={addRepairContent} className="add-btn">
                ➕ Thêm nội dung sửa chữa
              </button>
            </div>

            <button type="submit" className="submit-btn">
              {isEditing ? '✅ Cập nhật xe' : '✅ Thêm xe'}
            </button>
          </form>
        )}

        {activeTab === 'list' && (
          <div className="cars-list">
            <h3>Danh sách xe</h3>
            {cars
              .filter(car =>
                car.plateNumber.toLowerCase().includes(searchPlate.toLowerCase())
              )
              .map(car => {
                const isExpanded = expandedCarIds.includes(car._id);
                return (
                  <div key={car._id} className="car-box">
                    <div className="car-box-header">
                      <div className="car-box-title" onClick={() => toggleCarExpand(car._id)} style={{ cursor: 'pointer', fontWeight: 600, fontSize: '1.1rem' }}>
                        <span style={{ marginRight: 12 }}>{isExpanded ? '▼' : '▶'}</span>
                        <b>Biển số:</b> {car.plateNumber} | <b>Loại xe:</b> {car.carType?.name || ''}
                      </div>
                      <div className="car-box-actions">
                        <button
                          onClick={() => handleEdit(car)}
                          style={{
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: 4,
                            cursor: 'pointer',
                            marginRight: 8
                          }}
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => openDeleteDialog(car._id)}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: 4,
                            cursor: 'pointer',
                          }}
                        >
                          Xoá
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="car-box-detail">
                        <table>
                          <thead>
                            <tr>
                              <th colSpan={2}>Sản phẩm</th>
                              <th>Đơn vị</th>
                              <th>Thuế</th>
                              <th>Số lượng</th>
                              <th>Giá</th>
                              <th>Tiền sau thuế</th>
                              <th>Giải pháp</th>
                              <th>Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {car.repairContents?.map((rc, rcIndex) => {
                              const selectedRepairContent = repairContents.find(
                                item => item._id === (typeof rc.repairContent === 'object' ? rc.repairContent._id : rc.repairContent)
                              );
                              const rcProducts = rc.products || [];
                              const validProducts = rcProducts.filter(p => {
                                const productDetail = products.find(prod => prod._id === (p.product._id || p.product));
                                return productDetail;
                              });
                              const isServiceOnly = !validProducts.length && rc.servicePrice;
                              return (
                                <React.Fragment key={`${car._id}-rc-${rcIndex}`}>
                                  <tr style={{ backgroundColor: '#f9f9f9' }}>
                                    <td colSpan={9}>
                                      <b>Nội dung sửa chữa:</b> {selectedRepairContent?.name || rc.name || 'Không có tên'}
                                    </td>
                                  </tr>
                                  {validProducts.length > 0 ? (
                                    validProducts.map((p, index) => {
                                      const productDetail = products.find(prod => prod._id === (p.product._id || p.product));
                                      if (!productDetail) return null;
                                      return (
                                        <tr key={`${car._id}-rc-${rcIndex}-p-${index}`}>
                                          <td colSpan={2} style={{ wordBreak: 'break-word' }}>
                                            <div style={{ marginBottom: 8, borderBottom: "1px solid #ddd", paddingBottom: 8 }}>
                                              <p style={{ margin: '4px 0' }}>Mã: {productDetail.code}</p>
                                              <p style={{ margin: '4px 0' }}>Thương hiệu: {productDetail.brand || "N/A"}</p>
                                              <p style={{ margin: '4px 0' }}>Xuất xứ: {productDetail.origin || "N/A"}</p>
                                              <p style={{ margin: '4px 0' }}>Thông số:</p>
                                              <ul style={{ paddingLeft: 16, marginTop: 0 }}>
                                                {productDetail.specs?.length
                                                  ? productDetail.specs.map((spec, i) => (
                                                    <li key={i} style={{ listStyleType: 'disc', marginLeft: 8 }}>{spec}</li>
                                                  ))
                                                  : <li>N/A</li>}
                                              </ul>
                                            </div>
                                          </td>
                                          <td>{productDetail.unit?.name || "N/A"}</td>
                                          <td>{productDetail.tax || "0"}%</td>
                                          <td>{p.quantity || 1}</td>
                                          <td>{productDetail.price?.toLocaleString() || "0"}đ</td>
                                          <td>{calculateTotalAfterTax(productDetail.price, productDetail.tax, p.quantity).toLocaleString()}đ</td>
                                          <td>
                                            {p.solutions?.length > 0 ? (
                                              p.solutions.map((sol, idx) => (
                                                <div key={idx}><b>{sol?.name || 'Không rõ giải pháp'}</b></div>
                                              ))
                                            ) : <b>Chưa có giải pháp</b>}
                                          </td>
                                          <td>
                                            {p.statuses?.length > 0 ? (
                                              p.statuses.map((status, idx) => (
                                                <div key={idx}><b>{status?.name || 'Không rõ trạng thái'}</b></div>
                                              ))
                                            ) : <b>Chưa cập nhật</b>}
                                          </td>
                                        </tr>
                                      );
                                    })
                                  ) : isServiceOnly ? (
                                    <tr>
                                      <td colSpan={2}><b>Dịch vụ công</b></td>
                                      <td>công</td>
                                      <td>8%</td>
                                      <td>1</td>
                                      <td>{rc.servicePrice?.toLocaleString() || "0"}đ</td>
                                      <td>{calculateServiceAfterTax(rc.servicePrice).toLocaleString()}đ</td>
                                      <td><b>{rc.solutions?.map(sol => sol.name).join(', ')}</b></td>
                                      <td><b>{rc.statuses?.map(st => st.name).join(', ')}</b></td>
                                    </tr>
                                  ) : (
                                    <tr>
                                      <td colSpan={9} style={{ textAlign: 'center', color: '#888' }}>Không có sản phẩm</td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                            <tr style={{ backgroundColor: "#f0f0f0", fontWeight: "bold" }}>
                              <td colSpan={7} style={{ textAlign: "right" }}>Tổng tiền của xe:</td>
                              <td colSpan={2} style={{ color: "green" }}>
                                {calculateCarTotal(car).toLocaleString()} VND
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
        {activeTab === 'summary' && (
          <div style={{
            maxWidth: 1200,
            margin: '0 auto 32px auto',
            background: '#fffbe6',
            border: '3px solid #ffe066',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            padding: 24
          }}>
            <table style={{ width: '100%', fontSize: 20, fontWeight: 600, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fff3bf' }}>
                  <th style={{ width: 220, border: '2px solid #ffe066' }}></th>
                  <th style={{ border: '2px solid #ffe066' }}>Thuế suất 8%</th>
                  <th style={{ border: '2px solid #ffe066' }}>Thuế suất 10%</th>
                  <th style={{ border: '2px solid #ffe066' }}>Tổng cộng</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '2px solid #ffe066' }}>Tiền trước thuế</td>
                  <td style={{ border: '2px solid #ffe066', textAlign: 'center' }}>{formatMoney(taxSummary.all8PreTax)}</td>
                  <td style={{ border: '2px solid #ffe066', textAlign: 'center' }}>{formatMoney(taxSummary.all10PreTax)}</td>
                  <td style={{ border: '2px solid #ffe066', textAlign: 'center' }}>{formatMoney(taxSummary.allPreTax)}</td>
                </tr>
                <tr>
                  <td style={{ border: '2px solid #ffe066' }}>Thuế GTGT</td>
                  <td style={{ border: '2px solid #ffe066', textAlign: 'center' }}>{formatMoney(taxSummary.allVat8)}</td>
                  <td style={{ border: '2px solid #ffe066', textAlign: 'center' }}>{formatMoney(taxSummary.allVat10)}</td>
                  <td style={{ border: '2px solid #ffe066', textAlign: 'center' }}>{formatMoney(taxSummary.allVat)}</td>
                </tr>
                <tr style={{ background: '#fff3bf' }}>
                  <td style={{ border: '2px solid #ffe066' }}>Tiền thanh toán</td>
                  <td style={{ border: '2px solid #ffe066', textAlign: 'center', fontWeight: 'bold', fontSize: 22 }}>{formatMoney(taxSummary.all8PostTax)}</td>
                  <td style={{ border: '2px solid #ffe066', textAlign: 'center', fontWeight: 'bold', fontSize: 22 }}>{formatMoney(taxSummary.all10PostTax)}</td>
                  <td style={{ border: '2px solid #ffe066', textAlign: 'center', fontWeight: 'bold', fontSize: 22 }}>{formatMoney(taxSummary.allPostTax)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dialog xác nhận xóa */}
      {showDeleteDialog && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{ background: 'white', padding: 32, borderRadius: 12, minWidth: 320, boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
            <h3 style={{ marginBottom: 16 }}>Xác nhận xoá xe?</h3>
            <p>Bạn có chắc chắn muốn xoá xe này không? Hành động này không thể hoàn tác.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button onClick={closeDeleteDialog} style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#ccc', color: '#222', fontWeight: 500, cursor: 'pointer' }}>Huỷ</button>
              <button
                onClick={async () => {
                  if (confirmDeleteId) {
                    await handleDelete(confirmDeleteId);
                    closeDeleteDialog();
                  }
                }}
                style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#dc3545', color: 'white', fontWeight: 600, cursor: 'pointer' }}
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .loading-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100px;
        }

        .loading-spinner::after {
          content: "";
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .car-manager, .car-manager * {
          box-sizing: border-box;
        }
        .car-manager {
          padding: 3rem;
          max-width: 1400px;
          margin: 0 auto;
          background-color: #f8f9fa;
          min-height: 100vh;
          margin-top: 30px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          width: 1300px;
        }

        .header h2 {
          color: #2c3e50;
          margin: 0;
          font-size: 1.8rem;
        }

        .actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .search-input {
          padding: 0.75rem 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          width: 300px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #4a90e2;
          box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
        }

        .export-btn {
          background-color: #28a745;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .export-btn:hover {
          background-color: #218838;
          transform: translateY(-1px);
        }

        .tabs {
          display: flex;
          gap: 1rem;
          width: 1300px;
          margin-bottom: 2rem;
          background: white;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .tab-button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          background: #f8f9fa;
          color: #2c3e50;
          transition: all 0.3s ease;
        }

        .tab-button:hover {
          background: #e9ecef;
          transform: translateY(-1px);
        }

        .tab-button.active {
          background: #4a90e2;
          color: white;
        }

        .tab-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          padding: 2rem;
          width: 1300px;
          overflow-x: auto;
        }

        .car-form {
          background: transparent;
          padding: 0;
          border-radius: 0;
          box-shadow: none;
          margin-bottom: 0;
          width: 100%;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .form-header h3 {
          color: #2c3e50;
          margin: 0;
          font-size: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
          width: 100%;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.75rem;
          font-weight: 600;
          color: #2c3e50;
          margin-left: 10px;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          max-width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #4a90e2;
          box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
        }

        .repair-contents {
          width: 100%;
        }
          
        .repair-content-item {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          background: #f8f9fa;
          transition: all 0.3s ease;
          width: 100%;
          max-width: 100%;
          margin-top: 1.5rem;
        }

        .product-item {
          background: white;
          padding: 1.25rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          border: 1px solid #e0e0e0;
          width: 100%;
          max-width: 100%;
          margin-top: 1rem;
        }

        .product-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          align-items: center;
          flex-wrap: wrap;
          width: 100%;
          max-width: 100%;
          margin-top: 0.5rem;
        }

        .product-header > * {
          flex: 1;
          min-width: 200px;
          max-width: 100%;
          margin-bottom: 0.5rem;
        }

        .product-header .remove-btn {
          flex: 0 0 auto;
          min-width: auto;
        }

        .product-details {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e0e0e0;
          width: 100%;
          max-width: 100%;
        }

        .status-item,
        .solution-item {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.75rem;
          align-items: center;
          flex-wrap: wrap;
          width: 100%;
          max-width: 100%;
          margin-top: 0.5rem;
        }

        .status-item > *,
        .solution-item > * {
          flex: 1;
          min-width: 200px;
          max-width: 100%;
          margin-bottom: 0.5rem;
        }

        .status-item .remove-btn,
        .solution-item .remove-btn {
          flex: 0 0 auto;
          min-width: auto;
        }

        .add-btn {
          background: #4a90e2;
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          margin: 0.5rem 10px;
          white-space: nowrap;
        }

        .add-btn:hover {
          background: #357abd;
          transform: translateY(-1px);
        }

        .remove-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          white-space: nowrap;
          min-width: auto;
        }

        .remove-btn:hover {
          background: #c82333;
          transform: translateY(-1px);
        }

        .submit-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          margin-top: 2rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          width: auto;
          white-space: nowrap;
        }

        .submit-btn:hover {
          background: #218838;
          transform: translateY(-1px);
        }

        .cancel-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          white-space: nowrap;
          min-width: auto;
        }

        .cancel-btn:hover {
          background: #c82333;
          transform: translateY(-1px);
        }

        .cars-list {
          background: transparent;
          padding: 0;
          border-radius: 0;
          box-shadow: none;
        }

        .cars-list h3 {
          color: #2c3e50;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
        }

        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-top: 1rem;
        }

        th, td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }

        th {
          background: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
        }

        tr:hover {
          background-color: #f8f9fa;
        }

        /* Custom styles for react-select */
        :global(.react-select__control) {
          min-height: 42px !important;
          max-width: 100% !important;
        }

        :global(.react-select__menu) {
          max-width: 100% !important;
        }

        :global(.react-select__value-container) {
          max-width: 100% !important;
        }

        :global(.react-select__input-container) {
          max-width: 100% !important;
        }

        /* Responsive styles */
        @media (max-width: 1400px) {
          .car-manager {
            padding: 1rem;
          }

          .header,
          .tabs,
          .tab-content {
            width: 100%;
          }

          .product-header > *,
          .status-item > *,
          .solution-item > * {
            max-width: 100%;
          }
        }

        .car-box {
          background: #f8f9fa;
          border-radius: 10px;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          border: 1px solid #e0e0e0;
          overflow: hidden;
          transition: box-shadow 0.2s;
        }
        .car-box-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1rem 1.5rem;
          background: #eee;
          border-bottom: 1px solid #e0e0e0;
          cursor: pointer;
        }
        .car-box-title {
          flex: 1;
          display: flex;
          align-items: center;
          font-size: 1.1rem;
          font-weight: 600;
        }
        .car-box-actions {
          display: flex;
          gap: 0.5rem;
        }
        .car-box-detail {
          padding: 1.5rem;
          background: #fff;
          animation: fadeIn 0.2s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </>
      )}
    </div>
  );
}

export default CarManager;
