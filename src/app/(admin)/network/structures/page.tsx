'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button, Card, Modal, Input, Select } from '@/components/ui';
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  LayersIcon,
  NetworkIcon,
  XIcon,
  UsersIcon,
  GroupIcon,
  SettingsIcon,
} from '@/components/icons';
import { structuresService, structureTypesService } from '@/services/network.service';
import {
  Structure,
  StructureType,
  CreateStructureDto,
  UpdateStructureDto,
  NetworkTreeNode,
} from '@/types/network';

// Stats Card Component (same style as Dashboard)
function StatsCard({
  label,
  value,
  subtitle,
  icon,
  loading,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] group hover:border-white/[0.15] transition-all duration-300"
      style={{ padding: '20px 24px' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p className="text-[11px] font-medium text-white/50 uppercase tracking-wider">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            {loading ? (
              <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
            ) : (
              <span className="text-2xl font-semibold text-white">{value}</span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-white/40">{subtitle}</p>
          )}
        </div>
        <div className="p-2.5 rounded-xl bg-white/[0.05] text-gold group-hover:bg-gold/20 transition-all duration-300 flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({
  icon,
  label,
  description,
  href,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  href?: string;
  color: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white group-hover:text-gold transition-colors">
          {label}
        </p>
        {description && (
          <p className="text-sm text-white/40 truncate">{description}</p>
        )}
      </div>
      <ChevronRightIcon size={16} className="text-white/30 group-hover:text-gold group-hover:translate-x-1 transition-all" />
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300 w-full text-left"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href || '#'}
      className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300"
    >
      {content}
    </Link>
  );
}

// Tag Input Component for Countries
function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gold/10 text-gold rounded-lg text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:bg-gold/20 rounded-full p-0.5"
            >
              <XIcon size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            if (inputValue.trim() && !value.includes(inputValue.trim())) {
              onChange([...value, inputValue.trim()]);
              setInputValue('');
            }
          }}
        >
          <PlusIcon size={16} />
        </Button>
      </div>
    </div>
  );
}

// Tree Node Component
function TreeNode({
  node,
  level,
  onEdit,
  onDelete,
  onAddChild,
  expandedNodes,
  toggleExpand,
}: {
  node: NetworkTreeNode;
  level: number;
  onEdit: (node: NetworkTreeNode) => void;
  onDelete: (node: NetworkTreeNode) => void;
  onAddChild: (parentId: string) => void;
  expandedNodes: Set<string>;
  toggleExpand: (nodeId: string) => void;
}) {
  const t = useTranslations('network');
  const isExpanded = expandedNodes.has(node.id);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none">
      <div
        className={`
          flex items-center gap-2 py-3 px-4 rounded-xl transition-all duration-200 cursor-pointer
          hover:bg-gold/5 hover:border-gold/20 group border border-transparent
          ${level === 0 ? 'bg-white/[0.02]' : ''}
        `}
        style={{ marginLeft: `${level * 24}px` }}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={() => toggleExpand(node.id)}
          className={`p-1 rounded-lg transition-all ${
            hasChildren
              ? 'hover:bg-white/[0.08] text-text-muted'
              : 'text-transparent cursor-default'
          }`}
          disabled={!hasChildren}
        >
          {isExpanded ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
        </button>

        {/* Node Icon */}
        <div
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center
            ${level === 0 ? 'bg-gold/20 text-gold' : 'bg-white/[0.05] text-text-muted'}
          `}
        >
          <NetworkIcon size={20} />
        </div>

        {/* Node Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-text-primary truncate">{node.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.05] text-text-muted">
              {node.typeName || node.type}
            </span>
            {node.status !== 'ACTIVE' && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  node.status === 'INACTIVE' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                }`}
              >
                {node.status}
              </span>
            )}
          </div>
          {node.description && (
            <p className="text-xs text-text-muted truncate mt-0.5">{node.description}</p>
          )}
          {node.countries && node.countries.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              {node.countries.slice(0, 3).map((country) => (
                <span
                  key={country}
                  className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400"
                >
                  {country}
                </span>
              ))}
              {node.countries.length > 3 && (
                <span className="text-xs text-text-muted">
                  +{node.countries.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Children Count */}
        {(node.childrenCount || 0) > 0 && (
          <span className="text-xs text-text-muted px-2 py-1 rounded-full bg-white/[0.03]">
            {node.childrenCount} {t('children')}
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAddChild(node.id)}
            className="p-2 rounded-lg text-text-muted hover:text-gold hover:bg-gold/10 transition-colors"
            title={t('addChild')}
          >
            <PlusIcon size={16} />
          </button>
          <button
            onClick={() => onEdit(node)}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.05] transition-colors"
            title={t('edit')}
          >
            <EditIcon size={16} />
          </button>
          <button
            onClick={() => onDelete(node)}
            className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors"
            title={t('delete')}
            disabled={(node.childrenCount || 0) > 0}
          >
            <TrashIcon size={16} />
          </button>
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="relative">
          <div
            className="absolute left-0 top-0 bottom-0 border-l border-white/[0.05]"
            style={{ marginLeft: `${(level + 1) * 24 + 20}px` }}
          />
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              expandedNodes={expandedNodes}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function StructuresPage() {
  const t = useTranslations('network');
  const tCommon = useTranslations('common');

  const [treeData, setTreeData] = useState<NetworkTreeNode[]>([]);
  const [structureTypes, setStructureTypes] = useState<StructureType[]>([]);
  const [allStructures, setAllStructures] = useState<Structure[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState<NetworkTreeNode | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateStructureDto>({
    name: '',
    description: '',
    typeId: '',
    parentId: undefined,
    countries: [],
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [treeResponse, typesResponse, structuresResponse] = await Promise.all([
        structuresService.getTree(),
        structureTypesService.list(),
        structuresService.list({ status: 'ACTIVE' }),
      ]);

      // Use API data, fallback to mock only if empty
      const tree = treeResponse.length > 0 ? treeResponse : mockTreeData;
      const types = typesResponse.items.length > 0 ? typesResponse.items : mockStructureTypes;
      const structures = structuresResponse.items.length > 0 ? structuresResponse.items : mockStructures;

      setTreeData(tree);
      setStructureTypes(types);
      setAllStructures(structures);

      // Expand root nodes by default
      const rootIds = new Set(tree.map((node) => node.id));
      setExpandedNodes(rootIds);

      console.log('Loaded structure types:', types);
    } catch (error) {
      console.error('Failed to load data:', error);
      setTreeData(mockTreeData);
      setStructureTypes(mockStructureTypes);
      setAllStructures(mockStructures);
      setExpandedNodes(new Set(mockTreeData.map((node) => node.id)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const openCreateModal = (parentId?: string) => {
    setSelectedParentId(parentId || null);
    setFormData({
      name: '',
      description: '',
      typeId: structureTypes[0]?.id || '',
      parentId: parentId,
      countries: [],
    });
    setShowCreateModal(true);
  };

  const openEditModal = (node: NetworkTreeNode) => {
    setSelectedNode(node);
    // Find the full structure data
    const structure = allStructures.find((s) => s.id === node.id);
    setFormData({
      name: node.name,
      description: node.description || '',
      typeId: structure?.typeId || node.typeId || '',
      parentId: structure?.parentId,
      countries: node.countries || [],
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (node: NetworkTreeNode) => {
    setSelectedNode(node);
    setShowDeleteModal(true);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.typeId) return;

    setSaving(true);
    try {
      await structuresService.create({
        ...formData,
        code: formData.name.toUpperCase().replace(/\s+/g, '_'),
      });
      loadData();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create structure:', error);
      // For demo, add to mock data
      const mockNew: NetworkTreeNode = {
        id: `structure-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        type: formData.typeId,
        typeName: structureTypes.find((t) => t.id === formData.typeId)?.name,
        scope: 'SINGLE_CITY',
        status: 'ACTIVE',
        hierarchyLevel: 0,
        countries: formData.countries,
        leadersCount: 0,
        childrenCount: 0,
        workingUnitsCount: 0,
        children: [],
      };

      if (formData.parentId) {
        // Add as child
        setTreeData((prev) => addChildToTree(prev, formData.parentId!, mockNew));
      } else {
        setTreeData((prev) => [...prev, mockNew]);
      }
      setShowCreateModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedNode || !formData.name) return;

    setSaving(true);
    try {
      const updateData: UpdateStructureDto = {
        name: formData.name,
        description: formData.description,
        countries: formData.countries,
        parentId: formData.parentId || null,
      };
      // Only include typeId if it's a valid non-empty string
      if (formData.typeId && formData.typeId.trim() !== '') {
        updateData.typeId = formData.typeId;
      }
      console.log('Updating structure:', selectedNode.id, updateData);
      await structuresService.update(selectedNode.id, updateData);
      loadData();
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update structure:', error);
      // For demo, update in tree
      setTreeData((prev) =>
        updateNodeInTree(prev, selectedNode.id, {
          ...selectedNode,
          name: formData.name,
          description: formData.description,
          countries: formData.countries,
        })
      );
      setShowEditModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNode) return;

    setDeleting(true);
    try {
      await structuresService.delete(selectedNode.id);
      loadData();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete structure:', error);
      // For demo, remove from tree
      setTreeData((prev) => removeNodeFromTree(prev, selectedNode.id));
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  // Helper functions for tree manipulation
  const addChildToTree = (
    nodes: NetworkTreeNode[],
    parentId: string,
    newNode: NetworkTreeNode
  ): NetworkTreeNode[] => {
    return nodes.map((node) => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...(node.children || []), newNode],
          childrenCount: (node.childrenCount || 0) + 1,
        };
      }
      if (node.children) {
        return { ...node, children: addChildToTree(node.children, parentId, newNode) };
      }
      return node;
    });
  };

  const updateNodeInTree = (
    nodes: NetworkTreeNode[],
    nodeId: string,
    updates: Partial<NetworkTreeNode>
  ): NetworkTreeNode[] => {
    return nodes.map((node) => {
      if (node.id === nodeId) {
        return { ...node, ...updates };
      }
      if (node.children) {
        return { ...node, children: updateNodeInTree(node.children, nodeId, updates) };
      }
      return node;
    });
  };

  const removeNodeFromTree = (nodes: NetworkTreeNode[], nodeId: string): NetworkTreeNode[] => {
    return nodes
      .filter((node) => node.id !== nodeId)
      .map((node) => ({
        ...node,
        children: node.children ? removeNodeFromTree(node.children, nodeId) : undefined,
      }));
  };

  // Get parent structure options (excluding selected node and its descendants)
  const getParentOptions = () => {
    const options: { value: string; label: string }[] = [
      { value: '', label: t('noParent') },
    ];

    const addOptions = (nodes: NetworkTreeNode[], prefix = '') => {
      nodes.forEach((node) => {
        if (selectedNode && node.id === selectedNode.id) return; // Exclude self
        options.push({
          value: node.id,
          label: `${prefix}${node.name}`,
        });
        if (node.children) {
          addOptions(node.children, `${prefix}  `);
        }
      });
    };

    addOptions(treeData);
    return options;
  };

  // Calculate stats from tree data
  const countNodesInTree = (nodes: NetworkTreeNode[]): { total: number; active: number; types: Set<string> } => {
    let total = 0;
    let active = 0;
    const types = new Set<string>();

    const count = (nodeList: NetworkTreeNode[]) => {
      for (const node of nodeList) {
        total++;
        if (node.status === 'ACTIVE') active++;
        if (node.typeName) types.add(node.typeName);
        if (node.children) count(node.children);
      }
    };
    count(nodes);
    return { total, active, types };
  };

  const treeStats = countNodesInTree(treeData);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-text-muted">{tCommon('loading')}</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f35] via-[#141824] to-[#0d1117]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />

        <div className="relative p-8 md:p-10">
          {/* Back Link & Actions */}
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/network"
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-gold transition-colors"
            >
              <ChevronLeftIcon size={16} />
              {t('backToNetwork')}
            </Link>
            <Button leftIcon={<PlusIcon size={18} />} onClick={() => openCreateModal()}>
              {t('newStructure')}
            </Button>
          </div>

          {/* Title */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-xs font-medium text-gold uppercase tracking-wider">
              {t('structures')}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-white mb-3">
            {t('structures')}
          </h1>
          <p className="text-lg text-white/50 max-w-2xl">
            {t('structuresSubtitle')}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <StatsCard
              label={t('totalStructures')}
              value={treeStats.total || '-'}
              subtitle={`${treeStats.active} ${tCommon('active').toLowerCase()}`}
              icon={<NetworkIcon size={20} />}
              loading={loading}
            />
            <StatsCard
              label={t('activeStructures')}
              value={treeStats.active || '-'}
              icon={<LayersIcon size={20} />}
              loading={loading}
            />
            <StatsCard
              label={t('structureTypesCount')}
              value={structureTypes.length || '-'}
              icon={<GroupIcon size={20} />}
              loading={loading}
            />
            <StatsCard
              label={t('rootStructures')}
              value={treeData.length || '-'}
              icon={<UsersIcon size={20} />}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '32px' }} className="lg:!grid-cols-3">
        {/* Tree View - Takes 2 columns */}
        <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t('networkHierarchy')}</h2>
          </div>

          {treeData.length === 0 ? (
            <Card className="!p-0 overflow-hidden">
              <div className="text-center py-12">
                <LayersIcon size={48} className="mx-auto text-white/20 mb-4" />
                <p className="text-text-muted">{t('noStructures')}</p>
                <Button className="mt-4" onClick={() => openCreateModal()}>
                  {t('createFirstStructure')}
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="!p-0 overflow-hidden">
              <div className="p-4 border-b border-white/[0.05]">
                <p className="text-sm text-text-muted">{t('structuresTreeHint')}</p>
              </div>
              <div className="p-4 max-h-[600px] overflow-y-auto">
                <div className="space-y-1">
                  {treeData.map((node) => (
                    <TreeNode
                      key={node.id}
                      node={node}
                      level={0}
                      onEdit={openEditModal}
                      onDelete={openDeleteModal}
                      onAddChild={(parentId) => openCreateModal(parentId)}
                      expandedNodes={expandedNodes}
                      toggleExpand={toggleExpand}
                    />
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar - Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t('quickActions')}</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <QuickActionCard
              icon={<PlusIcon size={18} />}
              label={t('newStructure')}
              description={t('createStructureHint')}
              onClick={() => openCreateModal()}
              color="bg-emerald-500/20 text-emerald-400"
            />
            <QuickActionCard
              icon={<LayersIcon size={18} />}
              label={t('structureTypes')}
              description={t('manageTypes')}
              href="/network/structure-types"
              color="bg-violet-500/20 text-violet-400"
            />
            <QuickActionCard
              icon={<SettingsIcon size={18} />}
              label={t('scopes')}
              description={t('configureScopesHint')}
              href="/settings/scopes"
              color="bg-amber-500/20 text-amber-400"
            />
            <QuickActionCard
              icon={<NetworkIcon size={18} />}
              label={t('networkOverview')}
              description={t('viewNetworkHierarchy')}
              href="/network"
              color="bg-blue-500/20 text-blue-400"
            />
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('newStructure')}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={!formData.name || !formData.typeId || saving}>
              {saving ? t('saving') : tCommon('create')}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Select
            label={t('structureType')}
            options={structureTypes.map((type) => ({ value: type.id, label: type.name }))}
            value={formData.typeId}
            onChange={(e) => setFormData({ ...formData, typeId: e.target.value })}
            required
          />

          <Select
            label={t('parentStructure')}
            options={getParentOptions()}
            value={formData.parentId || ''}
            onChange={(e) => setFormData({ ...formData, parentId: e.target.value || undefined })}
            hint={t('parentStructureHint')}
          />

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              {t('countries')}
            </label>
            <TagInput
              value={formData.countries || []}
              onChange={(countries) => setFormData({ ...formData, countries })}
              placeholder={t('countryPlaceholder')}
            />
          </div>

          <Input
            label={t('structureName')}
            placeholder={t('structureNamePlaceholder')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              {t('description')}
            </label>
            <textarea
              placeholder={t('descriptionPlaceholder')}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-gold/50 focus:ring-1 focus:ring-gold/20 focus:outline-none transition-all resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={t('editStructure')}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowEditModal(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleUpdate} disabled={!formData.name || saving}>
              {saving ? t('saving') : tCommon('save')}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Select
            label={t('structureType')}
            options={structureTypes.map((type) => ({ value: type.id, label: type.name }))}
            value={formData.typeId}
            onChange={(e) => setFormData({ ...formData, typeId: e.target.value })}
          />

          <Select
            label={t('parentStructure')}
            options={getParentOptions()}
            value={formData.parentId || ''}
            onChange={(e) => setFormData({ ...formData, parentId: e.target.value || undefined })}
            hint={t('parentStructureHint')}
          />

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              {t('countries')}
            </label>
            <TagInput
              value={formData.countries || []}
              onChange={(countries) => setFormData({ ...formData, countries })}
              placeholder={t('countryPlaceholder')}
            />
          </div>

          <Input
            label={t('structureName')}
            placeholder={t('structureNamePlaceholder')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              {t('description')}
            </label>
            <textarea
              placeholder={t('descriptionPlaceholder')}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-gold/50 focus:ring-1 focus:ring-gold/20 focus:outline-none transition-all resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('deleteStructure')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              {tCommon('cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleting || (selectedNode?.childrenCount || 0) > 0}
            >
              {deleting ? t('deleting') : tCommon('delete')}
            </Button>
          </>
        }
      >
        {(selectedNode?.childrenCount || 0) > 0 ? (
          <p className="text-error">{t('cannotDeleteWithChildren')}</p>
        ) : (
          <p className="text-text-secondary">
            {t('deleteStructureConfirm')}{' '}
            <strong className="text-text-primary">{selectedNode?.name}</strong>?
          </p>
        )}
      </Modal>
    </div>
  );
}

// Mock data (fallback only - real data comes from API)
const mockStructureTypes: StructureType[] = [
  {
    id: 'type-global',
    tenantId: 'demo-tenant',
    code: 'COMUNIDADE',
    name: 'Comunidade',
    description: 'Estrutura global da organização',
    maxLevels: 10,
    allowNested: true,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'type-regional',
    tenantId: 'demo-tenant',
    code: 'REGIONAL',
    name: 'Regional',
    description: 'Estrutura regional',
    maxLevels: 10,
    allowNested: true,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'type-municipal',
    tenantId: 'demo-tenant',
    code: 'MUNICIPAL',
    name: 'Municipal',
    description: 'Estrutura municipal',
    maxLevels: 10,
    allowNested: true,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockStructures: Structure[] = [
  {
    id: 'structure-global',
    tenantId: 'demo-tenant',
    name: 'Comunidade Global',
    description: 'Estrutura global da organização',
    typeId: 'type-global',
    status: 'ACTIVE',
    scope: 'GLOBAL_ALL_COUNTRIES',
    hierarchyLevel: 0,
    countries: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'structure-iberica',
    tenantId: 'demo-tenant',
    name: 'Comunidade Ibérica',
    description: 'Comunidade da Península Ibérica',
    typeId: 'type-regional',
    parentId: 'structure-global',
    status: 'ACTIVE',
    scope: 'COUNTRY_GROUP',
    hierarchyLevel: 1,
    countries: ['Portugal', 'Espanha'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockTreeData: NetworkTreeNode[] = [
  {
    id: 'structure-global',
    name: 'Comunidade Global',
    description: 'Estrutura global da organização',
    type: 'type-global',
    typeName: 'Comunidade',
    scope: 'GLOBAL_ALL_COUNTRIES',
    status: 'ACTIVE',
    hierarchyLevel: 0,
    countries: [],
    leadersCount: 3,
    childrenCount: 2,
    workingUnitsCount: 0,
    children: [
      {
        id: 'structure-iberica',
        name: 'Comunidade Ibérica',
        description: 'Comunidade da Península Ibérica',
        type: 'type-regional',
        typeName: 'Regional',
        scope: 'COUNTRY_GROUP',
        status: 'ACTIVE',
        hierarchyLevel: 1,
        countries: ['Portugal', 'Espanha'],
        leadersCount: 2,
        childrenCount: 2,
        workingUnitsCount: 0,
        children: [
          {
            id: 'structure-lisboa',
            name: 'Lisboa',
            description: 'Estrutura de Lisboa',
            type: 'type-city',
            typeName: 'Municipal',
            scope: 'SINGLE_CITY',
            status: 'ACTIVE',
            hierarchyLevel: 2,
            countries: ['Portugal'],
            leadersCount: 1,
            childrenCount: 0,
            workingUnitsCount: 0,
          },
          {
            id: 'structure-madrid',
            name: 'Madrid',
            description: 'Estrutura de Madrid',
            type: 'type-city',
            typeName: 'Municipal',
            scope: 'SINGLE_CITY',
            status: 'ACTIVE',
            hierarchyLevel: 2,
            countries: ['Espanha'],
            leadersCount: 1,
            childrenCount: 0,
            workingUnitsCount: 0,
          },
        ],
      },
      {
        id: 'structure-latam',
        name: 'Comunidade LATAM',
        description: 'Comunidade da América Latina',
        type: 'type-regional',
        typeName: 'Regional',
        scope: 'COUNTRY_GROUP',
        status: 'ACTIVE',
        hierarchyLevel: 1,
        countries: ['Brasil', 'Argentina', 'Chile'],
        leadersCount: 2,
        childrenCount: 1,
        workingUnitsCount: 0,
        children: [
          {
            id: 'structure-sp',
            name: 'São Paulo',
            description: 'Estrutura de São Paulo',
            type: 'type-city',
            typeName: 'Municipal',
            scope: 'SINGLE_CITY',
            status: 'ACTIVE',
            hierarchyLevel: 2,
            countries: ['Brasil'],
            leadersCount: 1,
            childrenCount: 0,
            workingUnitsCount: 0,
          },
        ],
      },
    ],
  },
];
