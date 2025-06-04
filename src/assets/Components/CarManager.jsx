import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { getCars, createCar, updateCar, deleteCar } from '../api/carApi';
import { getCateCars } from '../api/cateCarApi';
import { getRepairContents } from '../api/repairContentApi';
import { getProducts } from '../api/productApi';
import { getSolutions } from '../api/solutionApi';
import { getStatuses } from '../api/statusApi';
import exportToExcel from './exportToExcel';
function CarManager() {
  const [cars, setCars] = useState([]);
  const [cateCars, setCateCars] = useState([]);
  const [repairContents, setRepairContents] = useState([]);
  const [products, setProducts] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [searchPlate, setSearchPlate] = useState('');
  const [form, setForm] = useState({
    plateNumber: '',
    carType: '',
    repairContents: [], // mảng các repairContent id với product mặc định là rỗng mảng
  });

  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({
    plateNumber: '',
    carType: '',
    repairContents: [],
  });
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
  // Load dữ liệu liên quan và danh sách xe
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
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
      setStatuses(statusRes.data);       // ✅ Gán status
      setSolutions(solutionRes.data);    // ✅ Gán solution
    } catch (error) {
      console.error('Lỗi khi load dữ liệu:', error);
    }
  };

  // Solutions - form thêm
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
  // Solutions - form sửa
  const addEditingSolutionToProduct = (rcIndex, pIndex) => {
    const newRepairContents = [...editingForm.repairContents];
    if (!newRepairContents[rcIndex].products[pIndex].solutions) {
      newRepairContents[rcIndex].products[pIndex].solutions = [];
    }
    newRepairContents[rcIndex].products[pIndex].solutions.push('');
    setEditingForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };

  const handleEditingSolutionChange = (rcIndex, pIndex, sIndex, value) => {
    const newRepairContents = [...editingForm.repairContents];
    newRepairContents[rcIndex].products[pIndex].solutions[sIndex] = value;
    setEditingForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };

  const removeEditingSolutionFromProduct = (rcIndex, pIndex, sIndex) => {
    const newRepairContents = [...editingForm.repairContents];
    newRepairContents[rcIndex].products[pIndex].solutions.splice(sIndex, 1);
    setEditingForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };

  // Statuses - form thêm
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

  // Statuses - form sửa
  const addEditingStatusToProduct = (rcIndex, pIndex) => {
    const newRepairContents = [...editingForm.repairContents];
    if (!newRepairContents[rcIndex].products[pIndex].statuses) {
      newRepairContents[rcIndex].products[pIndex].statuses = [];
    }
    newRepairContents[rcIndex].products[pIndex].statuses.push('');
    setEditingForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };

  const handleEditingStatusChange = (rcIndex, pIndex, sIndex, value) => {
    const newRepairContents = [...editingForm.repairContents];
    newRepairContents[rcIndex].products[pIndex].statuses[sIndex] = value;
    setEditingForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };

  const removeEditingStatusFromProduct = (rcIndex, pIndex, sIndex) => {
    const newRepairContents = [...editingForm.repairContents];
    newRepairContents[rcIndex].products[pIndex].statuses.splice(sIndex, 1);
    setEditingForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };

  // Xử lý form thêm
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Thêm repairContent vào form với products rỗng
  const addRepairContent = () => {
    setForm(prev => ({
      ...prev,
      repairContents: [...prev.repairContents, { repairContent: '', products: [] }]
    }));
  };

  // Chọn repairContent trong form thêm
  // const handleRepairContentChange = (index, value) => {
  //   const newRepairContents = [...form.repairContents];
  //   newRepairContents[index].repairContent = value;
  //   newRepairContents[index].products = []; // reset products khi đổi repairContent
  //   setForm(prev => ({ ...prev, repairContents: newRepairContents }));
  // };
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
  // Nếu dùng chung hàm này, bạn có thể thêm tham số thứ 3 là "isEditing"
  const handleServicePriceChange = (rcIndex, value, isEditing = false) => {
    // value có thể là string từ input, nên parseFloat nếu cần
    const parsedValue = value === '' ? '' : Number(value);
    if (isEditing) {
      const updated = [...editingForm.repairContents];
      updated[rcIndex] = {
        ...updated[rcIndex],
        servicePrice: parsedValue,
      };
      setEditingForm(prev => ({ ...prev, repairContents: updated }));
    } else {
      const updated = [...form.repairContents];
      updated[rcIndex] = {
        ...updated[rcIndex],
        servicePrice: parsedValue,
      };
      setForm(prev => ({ ...prev, repairContents: updated }));
    }
  };



  // Thêm product vào repairContent ở form thêm
  const addProductToRepairContent = (rcIndex) => {
    const newRepairContents = [...form.repairContents];
    // Thêm product mới với product rỗng (chưa chọn)
    newRepairContents[rcIndex].products.push({ product: '', quantity: 1, statuses: [], solutions: [] });
    setForm(prev => ({ ...prev, repairContents: newRepairContents }));
    // Không thêm id vì chưa chọn product
  };


  // Chọn product hoặc quantity trong form thêm
  const handleProductChange = (rcIndex, pIndex, field, value) => {
    const newRepairContents = [...form.repairContents];
    newRepairContents[rcIndex].products[pIndex][field] = value;
    setForm(prev => ({ ...prev, repairContents: newRepairContents }));

    if (field === 'product') {
      // Cập nhật mảng selectedProductIds theo sản phẩm mới được chọn
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

  // Gửi form thêm
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createCar(form);
      setForm({
        plateNumber: '',
        carType: '',
        repairContents: [],
      });
      fetchAllData();
    } catch (error) {
      console.error('Lỗi tạo xe:', error);
    }
  };

  // Sửa xe - set form sửa
  const handleEdit = (car) => {
    setEditingId(car._id);
    setEditingForm({
      plateNumber: car.plateNumber,
      carType: car.carType._id,
      repairContents: car.repairContents.map(rc => ({
        repairContent: rc.repairContent,
        servicePrice: rc.servicePrice ?? '',  // <-- thêm dòng này
        products: rc.products.map(p => ({
          product: p.product._id,
          quantity: p.quantity,
          statuses: (p.statuses || []).map(status => status._id),
          solutions: (p.solutions || []).map(solution => solution._id),
        }))
      })),
    });

  };



  // Các hàm tương tự cho form sửa
  const handleEditingFormChange = (e) => {
    const { name, value } = e.target;
    setEditingForm(prev => ({ ...prev, [name]: value }));
  };

  const addEditingRepairContent = () => {
    setEditingForm(prev => ({
      ...prev,
      repairContents: [...prev.repairContents, { repairContent: '', products: [] }]
    }));
  };

  const handleEditingRepairContentChange = (index, value) => {
    const newRepairContents = [...editingForm.repairContents];
    newRepairContents[index].repairContent = value;
    newRepairContents[index].products = [];
    setEditingForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };

  const addEditingProductToRepairContent = (rcIndex) => {
    const newRepairContents = [...editingForm.repairContents];
    newRepairContents[rcIndex].products.push({ product: '', quantity: 1, statuses: [], solutions: [] });
    setEditingForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };

  const handleEditingProductChange = (rcIndex, pIndex, field, value) => {
    const newRepairContents = [...editingForm.repairContents];
    newRepairContents[rcIndex].products[pIndex][field] = value;
    setEditingForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };

  const removeEditingProduct = (rcIndex, pIndex) => {
    const newRepairContents = [...editingForm.repairContents];
    newRepairContents[rcIndex].products.splice(pIndex, 1);
    setEditingForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };

  const removeEditingRepairContent = (rcIndex) => {
    const newRepairContents = [...editingForm.repairContents];
    newRepairContents.splice(rcIndex, 1);
    setEditingForm(prev => ({ ...prev, repairContents: newRepairContents }));
  };

  // Gửi form sửa
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateCar(editingId, editingForm);
      setEditingId(null);
      setEditingForm({
        plateNumber: '',
        carType: '',
        repairContents: [],
      });
      fetchAllData();
    } catch (error) {
      console.error('Lỗi cập nhật xe:', error);
    }
  };

  // Xóa xe
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xoá xe này?')) return;
    try {
      await deleteCar(id);
      fetchAllData();
    } catch (error) {
      console.error('Lỗi xoá xe:', error);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'auto',
      backgroundColor: '#f9f9f9',
      padding: 70,
      boxSizing: 'border-box'
    }}>
      <h2>Quản lý Xe</h2>

      {/* Form thêm xe */}
      <form onSubmit={handleCreate} style={{
        padding: 20,
        border: '1px solid #ccc',
        borderRadius: 8,
        maxWidth: 800,
        margin: '0 auto',
        background: '#f9f9f9'
      }}>
        <h2 style={{ marginBottom: 20 }}>🛠️ Thêm xe mới</h2>

        {/* Biển số */}
        <div style={{ marginBottom: 16 }}>
          <label><strong>Biển số:</strong></label><br />
          <input
            name="plateNumber"
            value={form.plateNumber}
            onChange={handleFormChange}
            required
            placeholder="VD: 51A-12345"
            style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>

        {/* Loại xe */}
        <div style={{ marginBottom: 16 }}>
          <label><strong>Loại xe:</strong></label><br />
          <select
            name="carType"
            value={form.carType}
            onChange={handleFormChange}
            required
            style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ccc' }}
          >
            <option value="">-- Chọn loại xe --</option>
            {cateCars.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Nội dung sửa chữa */}
        <div>
          <label><strong>Nội dung sửa chữa:</strong></label>
          {form.repairContents.map((rc, rcIndex) => {
            const selectedRepairContent = repairContents.find(r => r._id === rc.repairContent);
            const isCong = selectedRepairContent?.name?.toLowerCase() === 'công';

            return (
              <div key={rcIndex} style={{ border: '1px solid #ddd', borderRadius: 4, padding: 12, marginBottom: 12, background: '#fff' }}>
                {/* Chọn nội dung sửa chữa */}
                <Select
                  value={repairContents.find(r => r._id === rc.repairContent) || null}
                  onChange={selected => handleRepairContentChange(rcIndex, selected?._id || '')}
                  options={repairContents}
                  getOptionLabel={option => option.name}
                  getOptionValue={option => option._id}
                  placeholder="-- Chọn nội dung sửa chữa --"
                  isClearable
                  styles={{ container: base => ({ ...base, marginBottom: 8 }) }}
                />

                {/* Nếu là "Công" thì chỉ hiển thị ô nhập tiền */}
                {isCong ? (
                  <div style={{ marginTop: 10 }}>
                    <label><strong>Tiền công:</strong></label>
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
                      style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                    />
                    {rc.servicePrice ? (
                      <div style={{ marginTop: 8 }}>
                        <p>Thuế (8%): <strong>{(rc.servicePrice * 0.08).toLocaleString('vi-VN')} đ</strong></p>
                        <p>Tổng tiền sau thuế: <strong>{(rc.servicePrice * 1.08).toLocaleString('vi-VN')} đ</strong></p>
                      </div>
                    ) : null}
                  </div>
                ) : (

                  <>
                    {/* Danh sách sản phẩm */}
                    {rc.products.map((p, pIndex) => (
                      <div key={pIndex} style={{ marginBottom: 10, padding: 10, background: '#f1f1f1', borderRadius: 4 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                          <Select
                            value={products.find(prod => prod._id === p.product) || null}
                            onChange={selected => handleProductChange(rcIndex, pIndex, 'product', selected?._id || '')}
                            options={products}
                            getOptionLabel={option => option.code}
                            getOptionValue={option => option._id}
                            placeholder="-- Chọn sản phẩm --"
                            isClearable
                            styles={{ container: base => ({ ...base, flex: 1 }) }}
                          />
                          <input
                            type="number"
                            min={1}
                            value={p.quantity}
                            onChange={e => handleProductChange(rcIndex, pIndex, 'quantity', +e.target.value)}
                            style={{ width: 80, padding: 8 }}
                            required
                          />
                          <button type="button" onClick={() => removeProduct(rcIndex, pIndex)}>❌</button>
                        </div>

                        {/* Trạng thái */}
                        <div>
                          {p.statuses?.map((stt, stIndex) => (
                            <div key={stIndex} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                              <Select
                                value={statuses.find(opt => opt._id === stt) || null}
                                onChange={selected => handleStatusChange(rcIndex, pIndex, stIndex, selected?._id || '')}
                                options={statuses}
                                getOptionLabel={opt => opt.name}
                                getOptionValue={opt => opt._id}
                                placeholder="-- Chọn trạng thái --"
                                isClearable
                                styles={{ container: base => ({ ...base, flex: 1 }) }}
                              />

                              <button type="button" onClick={() => removeStatusFromProduct(rcIndex, pIndex, stIndex)}>❌</button>
                            </div>
                          ))}
                          <button type="button" onClick={() => addStatusToProduct(rcIndex, pIndex)}>⊕ Trạng thái</button>
                        </div>

                        {/* Giải pháp */}
                        <div style={{ marginTop: 8 }}>
                          {p.solutions?.map((sol, sIndex) => (
                            <div key={sIndex} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                              <Select
                                value={solutions.find(opt => opt._id === sol) || null}
                                onChange={selected => handleSolutionChange(rcIndex, pIndex, sIndex, selected?._id || '')}
                                options={solutions}
                                getOptionLabel={opt => opt.name}
                                getOptionValue={opt => opt._id}
                                placeholder="-- Chọn giải pháp --"
                                isClearable
                                styles={{ container: base => ({ ...base, flex: 1 }) }}
                              />

                              <button type="button" onClick={() => removeSolutionFromProduct(rcIndex, pIndex, sIndex)}>❌</button>
                            </div>
                          ))}
                          <button type="button" onClick={() => addSolutionToProduct(rcIndex, pIndex)}>🧩 Giải pháp</button>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => addProductToRepairContent(rcIndex)} style={{ marginBottom: 8 }}>🆕 Thêm sản phẩm</button><br />
                  </>
                )}
                <button type="button" onClick={() => removeRepairContent(rcIndex)}>❌ Xoá nội dung sửa chữa</button>
              </div>
            );
          })}
          <button type="button" onClick={addRepairContent} style={{ marginTop: 8 }}>➕ Thêm nội dung sửa chữa</button>
        </div>

        <button type="submit" style={{
          marginTop: 20,
          padding: '10px 20px',
          background: '#4caf50',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          fontSize: 16
        }}>
          ✅ Thêm xe
        </button>
      </form>
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => {
            const filteredCars = cars.filter(car =>
              car.plateNumber.toLowerCase().includes(searchPlate.toLowerCase())
            );
            const carsToExport = searchPlate.trim() ? filteredCars : cars;
            exportToExcel(carsToExport, repairContents, products);
          }}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          📥 Xuất Excel
        </button>
      </div>

      {/* Ô tìm kiếm biển số */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="🔍 Tìm theo biển số..."
          value={searchPlate}
          onChange={(e) => setSearchPlate(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 4,
            border: '1px solid #ccc',
            width: '250px',
            marginRight: '12px'
          }}
        />
      </div>


      {/* Danh sách xe */}
      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <h3>Danh sách xe</h3>
        <table
          border="1"
          cellPadding="12"
          cellSpacing="0"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'auto',
            fontSize: '14px',
          }}
        >
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
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {cars
              .filter(car =>
                car.plateNumber.toLowerCase().includes(searchPlate.toLowerCase())
              )
              .map(car => {
                const totalRowsForCar = car.repairContents?.reduce((acc, rc) => {
                  const validProducts = (rc.products || []).filter(p => {
                    const productDetail = products.find(prod => prod._id === (p.product._id || p.product));
                    return productDetail;
                  });
                  const isServiceOnly = (!validProducts.length && rc.servicePrice);
                  return acc + 1 + (validProducts.length || isServiceOnly ? 1 : 0);
                }, 0) || 0;

                return (
                  <React.Fragment key={car._id}>
                    <tr style={{ backgroundColor: "#eee" }}>
                      <td colSpan={9}>
                        <b>Biển số:</b> {car.plateNumber} | <b>Loại xe:</b> {car.carType?.name || ''}
                      </td>
                      {totalRowsForCar > 0 && (
                        <td rowSpan={totalRowsForCar + 1} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <button
                              onClick={() => handleEdit(car)}
                              style={{
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: 4,
                                cursor: 'pointer',
                              }}
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(car._id)}
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
                        </td>
                      )}
                    </tr>

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
                      <td colSpan={3} style={{ color: "green" }}>
                        {calculateCarTotal(car).toLocaleString()} VND
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Form chỉnh sửa xe */}
{editingId && (
  <form onSubmit={handleUpdate} style={{
    padding: 20,
    border: '1px solid #ccc',
    borderRadius: 8,
    maxWidth: 800,
    margin: '40px auto 0',
    background: '#f9f9f9'
  }}>
    <h3 style={{ marginBottom: 20 }}>🛠️ Sửa xe</h3>

    {/* Biển số */}
    <div style={{ marginBottom: 16 }}>
      <label><strong>Biển số:</strong></label><br />
      <input
        name="plateNumber"
        value={editingForm.plateNumber}
        onChange={handleEditingFormChange}
        required
        style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ccc' }}
      />
    </div>

    {/* Loại xe */}
    <div style={{ marginBottom: 16 }}>
      <label><strong>Loại xe:</strong></label><br />
      <select
        name="carType"
        value={editingForm.carType}
        onChange={handleEditingFormChange}
        required
        style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ccc' }}
      >
        <option value="">-- Chọn loại xe --</option>
        {cateCars.map(c => (
          <option key={c._id} value={c._id}>{c.name}</option>
        ))}
      </select>
    </div>

    {/* Nội dung sửa chữa */}
    <div>
      <label><strong>Nội dung sửa chữa:</strong></label>
      {editingForm.repairContents.map((rc, rcIndex) => {
        const selectedRepairContent = repairContents.find(r => r._id === rc.repairContent);
        const isCong = selectedRepairContent?.name?.toLowerCase() === 'công';

        return (
          <div key={rcIndex} style={{ border: '1px solid #ddd', borderRadius: 4, padding: 12, marginBottom: 12, background: '#fff' }}>
            {/* Chọn nội dung sửa chữa với react-select */}
            <Select
              value={repairContents.find(r => r._id === rc.repairContent) || null}
              onChange={selected => handleEditingRepairContentChange(rcIndex, selected?._id || '')}
              options={repairContents}
              getOptionLabel={opt => opt.name}
              getOptionValue={opt => opt._id}
              placeholder="-- Chọn nội dung sửa chữa --"
              isClearable
            />

            {/* Nếu là "Công" thì hiển thị input tiền công */}
            {isCong ? (
              <div style={{ marginTop: 10 }}>
                <label><strong>Tiền công:</strong></label>
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
                      handleServicePriceChange(rcIndex, numericValue === '' ? 0 : Number(numericValue), true);
                    }
                  }}
                  required
                  placeholder="Nhập tiền công"
                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                />
              </div>
            ) : (
              <>
                {/* Danh sách sản phẩm */}
                {rc.products.map((p, pIndex) => (
                  <div key={pIndex} style={{ marginBottom: 10, padding: 10, background: '#f1f1f1', borderRadius: 4 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                      {/* Sản phẩm với react-select */}
                      <Select
                        value={products.find(prod => prod._id === p.product) || null}
                        onChange={selected => handleEditingProductChange(rcIndex, pIndex, 'product', selected?._id || '')}
                        options={products}
                        getOptionLabel={opt => opt.code}
                        getOptionValue={opt => opt._id}
                        placeholder="-- Chọn sản phẩm --"
                        isClearable
                        styles={{ container: base => ({ flex: 1, ...base }) }}
                      />

                      <input
                        type="number"
                        min={1}
                        value={p.quantity}
                        onChange={e => handleEditingProductChange(rcIndex, pIndex, 'quantity', +e.target.value)}
                        style={{ width: 80, padding: 8 }}
                        required
                      />
                      <button type="button" onClick={() => removeEditingProduct(rcIndex, pIndex)}>❌</button>
                    </div>

                    {/* Trạng thái */}
                    <div>
                      {p.statuses?.map((stt, stIndex) => (
                        <div key={stIndex} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                          <Select
                            value={statuses.find(s => s._id === stt) || null}
                            onChange={selected => handleEditingStatusChange(rcIndex, pIndex, stIndex, selected?._id || '')}
                            options={statuses}
                            getOptionLabel={opt => opt.name}
                            getOptionValue={opt => opt._id}
                            placeholder="-- Chọn trạng thái --"
                            isClearable
                            styles={{ container: base => ({ flex: 1, ...base }) }}
                          />
                          <button type="button" onClick={() => removeEditingStatusFromProduct(rcIndex, pIndex, stIndex)}>❌</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addEditingStatusToProduct(rcIndex, pIndex)}>⊕ Trạng thái</button>
                    </div>

                    {/* Giải pháp */}
                    <div style={{ marginTop: 8 }}>
                      {p.solutions?.map((sol, sIndex) => (
                        <div key={sIndex} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                          <Select
                            value={solutions.find(s => s._id === sol) || null}
                            onChange={selected => handleEditingSolutionChange(rcIndex, pIndex, sIndex, selected?._id || '')}
                            options={solutions}
                            getOptionLabel={opt => opt.name}
                            getOptionValue={opt => opt._id}
                            placeholder="-- Chọn giải pháp --"
                            isClearable
                            styles={{ container: base => ({ flex: 1, ...base }) }}
                          />
                          <button type="button" onClick={() => removeEditingSolutionFromProduct(rcIndex, pIndex, sIndex)}>❌</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addEditingSolutionToProduct(rcIndex, pIndex)}>🧩 Giải pháp</button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => addEditingProductToRepairContent(rcIndex)} style={{ marginBottom: 8 }}>🆕 Thêm sản phẩm</button><br />
              </>
            )}

            <button type="button" onClick={() => removeEditingRepairContent(rcIndex)}>❌ Xoá nội dung sửa chữa</button>
          </div>
        );
      })}
      <button type="button" onClick={addEditingRepairContent} style={{ marginTop: 8 }}>➕ Thêm nội dung sửa chữa</button>
    </div>

    <button type="submit" style={{
      marginTop: 20,
      padding: '10px 20px',
      background: '#4caf50',
      color: '#fff',
      border: 'none',
      borderRadius: 4,
      fontSize: 16,
      fontWeight: 'bold'
    }}>
      ✅ Cập nhật xe
    </button>
    <button
      type="button"
      onClick={() => {
        setEditingId(null);
        setEditingForm({
          plateNumber: '',
          carType: '',
          repairContents: [],
        });
      }}
      style={{
        marginLeft: 10,
        marginTop: 20,
        padding: '10px 20px',
        background: '#f44336',
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        fontSize: 16,
        fontWeight: 'bold',
        cursor: 'pointer'
      }}
    >
      Huỷ
    </button>
  </form>
)}


    </div>
  );
}

export default CarManager;
