import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, Package, TrendingUp, Layers } from 'lucide-react';
import Layout from '../components/layout/Layout';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import StatCard from '../components/common/StatCard';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ProductFormModal from '../components/products/ProductFormModal';
import { getProducts, deleteProduct } from '../api';
import { toProductTableRows, formatCurrency } from '../services/product.service';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [formState, setFormState] = useState({ open: false, mode: 'create', product: null });
  const [deleteState, setDeleteState] = useState({ open: false, product: null, loading: false, error: '' });

  // Future architecture support (multi-boutiques)
  const currentStoreId = null;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const data = await getProducts(currentStoreId);
      setProducts(data || []);
    } catch (error) {
      console.error("Erreur chargement produits:", error);
      setLoadError("Impossible de charger le catalogue produits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const rows = useMemo(() => toProductTableRows(products), [products]);

  const stats = useMemo(() => {
    const total = products.length;
    const actifs = products.filter((p) => (p.status || 'actif') === 'actif').length;
    const margeMoyenne = total > 0
      ? products.reduce((sum, p) => sum + (Number(p.prix_vente || 0) - Number(p.prix_achat || 0)), 0) / total
      : 0;

    return { total, actifs, margeMoyenne };
  }, [products]);

  const openCreateModal = () => setFormState({ open: true, mode: 'create', product: null });
  const openEditModal = (product) => setFormState({ open: true, mode: 'edit', product });
  const closeFormModal = () => setFormState((prev) => ({ ...prev, open: false }));

  const handleSaved = () => {
    closeFormModal();
    fetchProducts();
  };

  const openDeleteDialog = (product) => setDeleteState({ open: true, product, loading: false, error: '' });
  const closeDeleteDialog = () => setDeleteState({ open: false, product: null, loading: false, error: '' });

  const handleConfirmDelete = async () => {
    if (!deleteState.product) return;

    try {
      setDeleteState((prev) => ({ ...prev, loading: true, error: '' }));
      await deleteProduct(deleteState.product.id, currentStoreId);
      closeDeleteDialog();
      fetchProducts();
    } catch (error) {
      setDeleteState((prev) => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || error.message || 'Erreur lors de la suppression'
      }));
    }
  };

  const columns = [
    { header: 'Nom du Produit', accessor: 'nom' },
    { header: "Prix d'achat", accessor: 'prixAchat' },
    { header: 'Prix de vente', accessor: 'prixVente' },
    { header: 'Marge', cell: (row) => (
      <span style={{ color: row.margePositive ? 'var(--status-success)' : 'var(--status-error)', fontWeight: 600 }}>
        {row.marge} ({row.margePercent}%)
      </span>
    ) },
    { header: 'Statut', cell: (row) => <StatusBadge status={row.status} /> },
    { header: 'Créé le', accessor: 'date' },
    { header: 'Actions', align: 'right', cell: (row) => (
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          className="erp-btn erp-btn-secondary"
          onClick={(e) => { e.stopPropagation(); openEditModal(row.raw); }}
          aria-label="Modifier le produit"
        >
          <Pencil size={14} />
        </button>
        <button
          className="erp-btn erp-btn-danger"
          onClick={(e) => { e.stopPropagation(); openDeleteDialog(row.raw); }}
          aria-label="Supprimer le produit"
        >
          <Trash2 size={14} />
        </button>
      </div>
    ) }
  ];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Catalogue Produits</h1>
          <p className="page-subtitle">Suivez vos coûts et marges par produit</p>
        </div>
        <button className="erp-btn erp-btn-primary" onClick={openCreateModal}>
          <Plus size={16} />
          Nouveau Produit
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <StatCard
          title="Total Produits"
          value={loading ? '...' : stats.total}
          icon={<Package size={20} />}
          color="indigo"
        />
        <StatCard
          title="Produits Actifs"
          value={loading ? '...' : stats.actifs}
          icon={<Layers size={20} />}
          color="emerald"
        />
        <StatCard
          title="Marge Moyenne"
          value={loading ? '...' : formatCurrency(stats.margeMoyenne)}
          icon={<TrendingUp size={20} />}
          color="cyan"
        />
      </div>

      {loadError && (
        <div className="erp-card" style={{ padding: '16px 20px', marginBottom: '24px', color: 'var(--status-error)' }}>
          {loadError}
        </div>
      )}

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        emptyMessage="Aucun produit trouvé. Créez votre premier produit pour commencer."
      />

      <ProductFormModal
        open={formState.open}
        mode={formState.mode}
        product={formState.product}
        storeId={currentStoreId}
        onClose={closeFormModal}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={deleteState.open}
        title="Supprimer ce produit ?"
        message={
          deleteState.error
            ? deleteState.error
            : `Cette action est irréversible. Le produit "${deleteState.product?.nom || ''}" sera définitivement supprimé.`
        }
        confirmLabel="Supprimer"
        danger
        loading={deleteState.loading}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteDialog}
      />
    </Layout>
  );
};

export default ProductsPage;
