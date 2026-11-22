"use client";

import * as React from "react";
import {
  INDIAN_BUSINESS_CATEGORIES,
  BusinessCategory,
  BusinessSubcategory,
  DynamicFieldDefinition,
} from "@/lib/taxonomy/business-categories";
import {
  VendorProductItem,
  VendorServiceItem,
  VendorStallType,
} from "@/types/vendor";
import { useTranslation } from "@/lib/i18n/i18n-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  Plus,
  Trash2,
  Clock,
  MapPin,
  Check,
  Save,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Wrench,
  Package,
  Layers,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface DynamicVendorFormProps {
  initialData?: any;
  onSuccess?: (vendorId: string) => void;
}

const LOCAL_STORAGE_DRAFT_KEY = "kaamsetu_vendor_draft_v47";

export function DynamicVendorForm({ initialData, onSuccess }: DynamicVendorFormProps) {
  const { t, locale } = useTranslation();

  // Basic Information
  const [businessName, setBusinessName] = React.useState(initialData?.businessName || "");
  const [ownerName, setOwnerName] = React.useState(initialData?.ownerName || "");
  const [businessDescription, setBusinessDescription] = React.useState(
    initialData?.businessDescription || ""
  );
  const [businessPhone, setBusinessPhone] = React.useState(initialData?.businessPhone || "");
  const [contactPreference, setContactPreference] = React.useState<"phone" | "whatsapp" | "in_person">(
    initialData?.contactPreference || "phone"
  );

  // Category Selection
  const [selectedCategoryCode, setSelectedCategoryCode] = React.useState<string>(
    initialData?.primaryCategory || "home_repair"
  );
  const [selectedSubcategoryCode, setSelectedSubcategoryCode] = React.useState<string>(
    initialData?.subcategory || "electrician"
  );

  // Stall & Setup
  const [stallType, setStallType] = React.useState<VendorStallType>(
    initialData?.stallType || "fixed_stall"
  );
  const [operatingHours, setOperatingHours] = React.useState(
    initialData?.operatingHours || "08:00 AM - 08:00 PM (Mon-Sat)"
  );
  const [deliveryAvailable, setDeliveryAvailable] = React.useState<boolean>(
    Boolean(initialData?.deliveryAvailable)
  );

  // Location
  const [state, setState] = React.useState(initialData?.state || "Assam");
  const [district, setDistrict] = React.useState(initialData?.district || "Kamrup Metropolitan");
  const [city, setCity] = React.useState(initialData?.city || "Guwahati");
  const [locality, setLocality] = React.useState(initialData?.locality || "Paltan Bazaar");
  const [pincode, setPincode] = React.useState(initialData?.pincode || "781001");

  // Dynamic Category-Specific Attributes
  const [categoryAttributes, setCategoryAttributes] = React.useState<Record<string, any>>(
    initialData?.categoryAttributes || {}
  );

  // Product Catalog
  const [productCatalog, setProductCatalog] = React.useState<VendorProductItem[]>(
    initialData?.productCatalog || [
      { id: "item-1", name: "Standard Product / Item", price: 350, unit: "piece", inStock: true },
    ]
  );
  const [newProductName, setNewProductName] = React.useState("");
  const [newProductPrice, setNewProductPrice] = React.useState("");
  const [newProductUnit, setNewProductUnit] = React.useState("piece");

  // Services Catalog
  const [servicesCatalog, setServicesCatalog] = React.useState<VendorServiceItem[]>(
    initialData?.servicesCatalog || [
      {
        id: "svc-1",
        name: "On-Site Diagnostic & Consultation",
        price: 500,
        priceType: "fixed",
        durationEstimate: "1 hour",
      },
    ]
  );
  const [newServiceName, setNewServiceName] = React.useState("");
  const [newServicePrice, setNewServicePrice] = React.useState("");
  const [newServicePriceType, setNewServicePriceType] = React.useState<
    "fixed" | "starting_from" | "per_hour" | "per_day" | "per_unit"
  >("fixed");
  const [newServiceDuration, setNewServiceDuration] = React.useState("1-2 hours");

  // Business Images
  const [businessImages, setBusinessImages] = React.useState<string[]>(
    initialData?.businessImages || [
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80",
    ]
  );
  const [newImageUrl, setNewImageUrl] = React.useState("");

  // Draft Management State
  const [hasSavedDraft, setHasSavedDraft] = React.useState(false);
  const [savedDraftTimestamp, setSavedDraftTimestamp] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSavingDraft, setIsSavingDraft] = React.useState(false);

  const activeCategory: BusinessCategory | undefined = INDIAN_BUSINESS_CATEGORIES.find(
    (c) => c.code === selectedCategoryCode
  );
  const activeSubcategory: BusinessSubcategory | undefined =
    activeCategory?.subcategories.find((s) => s.code === selectedSubcategoryCode) ||
    activeCategory?.subcategories[0];

  // Check for saved local or server draft on mount
  React.useEffect(() => {
    if (!initialData) {
      try {
        const local = localStorage.getItem(LOCAL_STORAGE_DRAFT_KEY);
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed && parsed.businessName) {
            setHasSavedDraft(true);
            setSavedDraftTimestamp(parsed._savedAt || "Earlier today");
          }
        }
      } catch {
        // ignore storage errors
      }

      // Check server draft
      fetch("/api/vendor/draft")
        .then((r) => r.json())
        .then((res) => {
          if (res.draft && res.draft.draft_payload) {
            setHasSavedDraft(true);
            setSavedDraftTimestamp(
              new Date(res.draft.updated_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            );
          }
        })
        .catch(() => {});
    }
  }, [initialData]);

  // Restore draft handler
  const handleRestoreDraft = () => {
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_DRAFT_KEY);
      if (local) {
        const d = JSON.parse(local);
        if (d.businessName) setBusinessName(d.businessName);
        if (d.ownerName) setOwnerName(d.ownerName);
        if (d.businessDescription) setBusinessDescription(d.businessDescription);
        if (d.businessPhone) setBusinessPhone(d.businessPhone);
        if (d.contactPreference) setContactPreference(d.contactPreference);
        if (d.primaryCategory) setSelectedCategoryCode(d.primaryCategory);
        if (d.subcategory) setSelectedSubcategoryCode(d.subcategory);
        if (d.stallType) setStallType(d.stallType);
        if (d.operatingHours) setOperatingHours(d.operatingHours);
        if (d.state) setState(d.state);
        if (d.district) setDistrict(d.district);
        if (d.city) setCity(d.city);
        if (d.locality) setLocality(d.locality);
        if (d.pincode) setPincode(d.pincode);
        if (d.categoryAttributes) setCategoryAttributes(d.categoryAttributes);
        if (Array.isArray(d.productCatalog)) setProductCatalog(d.productCatalog);
        if (Array.isArray(d.servicesCatalog)) setServicesCatalog(d.servicesCatalog);
        if (Array.isArray(d.businessImages)) setBusinessImages(d.businessImages);
        toast.success("Saved draft restored successfully!");
        setHasSavedDraft(false);
      }
    } catch {
      toast.error("Could not parse draft data.");
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
    fetch("/api/vendor/draft", { method: "DELETE" }).catch(() => {});
    setHasSavedDraft(false);
    toast.info("Draft discarded.");
  };

  // Build current form payload
  const buildPayload = (isDraft: boolean) => ({
    businessName: businessName.trim() || (isDraft ? "Draft Stall" : ""),
    displayName: businessName.trim() || "Local Vendor",
    ownerName: ownerName.trim() || businessName.trim(),
    primaryCategory: selectedCategoryCode,
    subcategory: selectedSubcategoryCode,
    businessDescription,
    preferredLanguage: locale,
    businessPhone,
    contactPreference,
    businessAddress: `${locality}, ${city}, ${state} - ${pincode}`,
    state,
    district,
    city,
    locality,
    pincode,
    stallType,
    operatingHours,
    deliveryAvailable,
    productCatalog,
    servicesCatalog,
    businessImages,
    categoryAttributes,
    isDraft,
    _savedAt: new Date().toISOString(),
  });

  // Explicit Save as Draft
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const payload = buildPayload(true);
      localStorage.setItem(LOCAL_STORAGE_DRAFT_KEY, JSON.stringify(payload));

      await fetch("/api/vendor/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftStep: 1, draftPayload: payload }),
      });

      toast.success("Draft saved! You can resume from any device.");
    } catch {
      toast.success("Draft saved locally on this browser.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Dynamic field value change
  const handleFieldChange = (fieldId: string, value: any) => {
    setCategoryAttributes((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  // Add Product to Catalog
  const handleAddProduct = () => {
    if (!newProductName.trim() || !newProductPrice) {
      toast.error("Please enter both product name and price");
      return;
    }
    const priceNum = parseFloat(newProductPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setProductCatalog((prev) => [
      ...prev,
      {
        id: `prod-${Date.now()}`,
        name: newProductName.trim(),
        price: priceNum,
        unit: newProductUnit.trim() || "piece",
        inStock: true,
      },
    ]);
    setNewProductName("");
    setNewProductPrice("");
  };

  const handleRemoveProduct = (id: string) => {
    setProductCatalog((prev) => prev.filter((p) => p.id !== id));
  };

  // Add Service to Catalog
  const handleAddService = () => {
    if (!newServiceName.trim() || !newServicePrice) {
      toast.error("Please enter both service name and rate");
      return;
    }
    const priceNum = parseFloat(newServicePrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid rate");
      return;
    }

    setServicesCatalog((prev) => [
      ...prev,
      {
        id: `svc-${Date.now()}`,
        name: newServiceName.trim(),
        price: priceNum,
        priceType: newServicePriceType,
        durationEstimate: newServiceDuration.trim() || "1 hour",
      },
    ]);
    setNewServiceName("");
    setNewServicePrice("");
  };

  const handleRemoveService = (id: string) => {
    setServicesCatalog((prev) => prev.filter((s) => s.id !== id));
  };

  // Add Image URL
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setBusinessImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl("");
    toast.success("Photo added to showcase");
  };

  const handleRemoveImage = (index: number) => {
    setBusinessImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      toast.error("Please enter your business or stall name");
      return;
    }
    if (!locality.trim() || !city.trim() || !pincode.trim()) {
      toast.error("Please complete your stall location details");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildPayload(false);

      const res = await fetch("/api/vendor/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save vendor profile");
      }

      // Clear draft on successful publication
      localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
      fetch("/api/vendor/draft", { method: "DELETE" }).catch(() => {});

      toast.success("Vendor profile published successfully with 0% commission!");
      if (onSuccess) onSuccess(data.vendorId);
    } catch (err: any) {
      toast.error(err.message || "Failed to save vendor profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
      {/* Draft Resume Alert */}
      {hasSavedDraft && (
        <div className="p-4 rounded-md bg-sand/20 border border-sand-400 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <RotateCcw className="w-5 h-5 text-sand-800" />
            <div>
              <p className="text-xs font-bold text-forest">You have an unfinished vendor draft</p>
              <p className="text-[11px] text-charcoal-muted">
                Last modified: {savedDraftTimestamp || "Recently"}. Would you like to resume where you left off?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleRestoreDraft}
              className="bg-forest text-ivory text-xs font-semibold h-8"
            >
              Resume Draft
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDiscardDraft}
              className="border-forest/20 text-xs h-8 text-charcoal-muted"
            >
              Discard
            </Button>
          </div>
        </div>
      )}

      {/* 1. Category Selection */}
      <div className="p-6 rounded-md bg-card border border-forest/15 shadow-sovereign-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-forest/10">
          <Store className="w-5 h-5 text-forest" />
          <div>
            <h3 className="font-serif text-lg font-bold text-forest">
              1. Business Category & Primary Trade
            </h3>
            <p className="text-xs text-charcoal-muted">
              Choose the category that best describes your shop, stall, or craft workshop.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {INDIAN_BUSINESS_CATEGORIES.map((cat) => {
            const isSelected = selectedCategoryCode === cat.code;
            return (
              <button
                key={cat.code}
                type="button"
                onClick={() => {
                  setSelectedCategoryCode(cat.code);
                  if (cat.subcategories.length > 0) {
                    setSelectedSubcategoryCode(cat.subcategories[0].code);
                  }
                }}
                className={`p-3 rounded-sm border text-left transition-all ${
                  isSelected
                    ? "bg-forest text-ivory border-forest shadow-sm"
                    : "bg-background text-charcoal border-forest/15 hover:border-forest/30"
                }`}
              >
                <span className="block font-bold text-xs">{cat.name}</span>
                <span className={`block text-[10px] mt-0.5 ${isSelected ? "text-sand" : "text-charcoal-muted"}`}>
                  {cat.hindiName}
                </span>
              </button>
            );
          })}
        </div>

        {/* Subcategory Pills */}
        {activeCategory && activeCategory.subcategories.length > 0 && (
          <div className="pt-3 border-t border-forest/10 space-y-2">
            <Label className="text-xs font-semibold text-charcoal">
              Specific Sub-Trade / Specialization *
            </Label>
            <div className="flex flex-wrap gap-2">
              {activeCategory.subcategories.map((sub) => {
                const isSubSelected = selectedSubcategoryCode === sub.code;
                return (
                  <button
                    key={sub.code}
                    type="button"
                    onClick={() => setSelectedSubcategoryCode(sub.code)}
                    className={`px-3 py-1.5 rounded text-xs border transition-colors ${
                      isSubSelected
                        ? "bg-forest text-ivory border-forest font-semibold"
                        : "bg-background text-charcoal border-forest/15 hover:border-forest/30"
                    }`}
                  >
                    {sub.name} ({sub.hindiName})
                  </button>
                );
              })}
            </div>
            {activeSubcategory?.description && (
              <p className="text-[11px] text-charcoal-muted italic pt-1">
                {activeSubcategory.description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 2. Business Overview */}
      <div className="p-6 rounded-md bg-card border border-forest/15 shadow-sovereign-sm space-y-4">
        <h3 className="font-serif text-lg font-bold text-forest pb-2 border-b border-forest/10">
          2. Business Overview & Contact
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-charcoal">Business or Stall Name *</Label>
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Rameshwar Handloom Works / Assam Tea Corner"
              required
              className="text-xs border-forest/20"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-charcoal">Owner / Master Artisan Name</Label>
            <Input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="e.g. Rameshwar Sharma"
              className="text-xs border-forest/20"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-charcoal">Business Phone / WhatsApp *</Label>
            <Input
              value={businessPhone}
              onChange={(e) => setBusinessPhone(e.target.value)}
              placeholder="+91 98540 12345"
              className="text-xs border-forest/20 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-charcoal">Customer Contact Preference</Label>
            <select
              value={contactPreference}
              onChange={(e) => setContactPreference(e.target.value as any)}
              className="w-full text-xs h-9 px-3 rounded-sm border border-forest/20 bg-background text-charcoal"
            >
              <option value="phone">Direct Phone Call</option>
              <option value="whatsapp">WhatsApp Message</option>
              <option value="in_person">In-Person Stall Visit Only</option>
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold text-charcoal">Business Description</Label>
            <Textarea
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              placeholder="Describe your craft, goods, experience, and what makes your work trustworthy..."
              rows={3}
              className="text-xs border-forest/20"
            />
          </div>
        </div>
      </div>

      {/* 3. Category-Specific Dynamic Fields */}
      {activeSubcategory && activeSubcategory.fields.length > 0 && (
        <div className="p-6 rounded-md bg-card border border-forest/15 shadow-sovereign-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-forest/10">
            <Wrench className="w-5 h-5 text-forest" />
            <div>
              <h3 className="font-serif text-lg font-bold text-forest">
                3. {activeSubcategory.name} — Specialized Trade Details
              </h3>
              <p className="text-xs text-charcoal-muted">
                These customized fields adapt dynamically to your specific profession.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeSubcategory.fields.map((field) => {
              const val = categoryAttributes[field.id];

              if (field.type === "boolean") {
                return (
                  <div key={field.id} className="flex items-center gap-3 p-3 rounded-sm border border-forest/15 bg-background">
                    <input
                      type="checkbox"
                      id={field.id}
                      checked={Boolean(val)}
                      onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                      className="rounded border-forest/30 text-forest focus:ring-forest h-4 w-4"
                    />
                    <label htmlFor={field.id} className="text-xs font-medium text-charcoal cursor-pointer">
                      {field.defaultLabel}
                    </label>
                  </div>
                );
              }

              if (field.type === "select" && field.options) {
                return (
                  <div key={field.id} className="space-y-1.5">
                    <Label className="text-xs font-semibold text-charcoal">{field.defaultLabel}</Label>
                    <select
                      value={val || ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-full text-xs h-9 px-3 rounded-sm border border-forest/20 bg-background text-charcoal"
                    >
                      <option value="">Select option...</option>
                      {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              if (field.type === "multiselect" && field.options) {
                const currentVals: string[] = Array.isArray(val) ? val : [];
                return (
                  <div key={field.id} className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-semibold text-charcoal">{field.defaultLabel}</Label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {field.options.map((opt) => {
                        const isChecked = currentVals.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              const updated = isChecked
                                ? currentVals.filter((v) => v !== opt.value)
                                : [...currentVals, opt.value];
                              handleFieldChange(field.id, updated);
                            }}
                            className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                              isChecked
                                ? "bg-forest text-ivory border-forest font-semibold"
                                : "bg-card text-charcoal border-forest/15 hover:border-forest/30"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return (
                <div key={field.id} className="space-y-1.5">
                  <Label className="text-xs font-semibold text-charcoal">{field.defaultLabel}</Label>
                  <Input
                    type={field.type === "number" ? "number" : "text"}
                    value={val || ""}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    placeholder={field.placeholder || `Enter ${field.defaultLabel.toLowerCase()}`}
                    className="text-xs border-forest/20"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Product Catalog / Menu Items */}
      <div className="p-6 rounded-md bg-card border border-forest/15 shadow-sovereign-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-forest/10">
          <div>
            <h3 className="font-serif text-lg font-bold text-forest">
              4. Products & Physical Goods
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5">
              List physical items, fabrics, or materials you sell with transparent unit pricing.
            </p>
          </div>
          <Badge className="bg-forest/10 text-forest border-forest/20 text-xs">
            {productCatalog.length} Products
          </Badge>
        </div>

        {/* Existing Products */}
        <div className="space-y-2">
          {productCatalog.map((prod) => (
            <div
              key={prod.id}
              className="flex items-center justify-between p-3 rounded-sm border border-forest/15 bg-background text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-forest">{prod.name}</span>
                <span className="text-[11px] text-charcoal-muted">
                  ₹{prod.price} / {prod.unit}
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  In Stock
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveProduct(prod.id)}
                className="text-red-600 hover:text-red-800 p-1"
                aria-label="Remove product"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Product */}
        <div className="pt-2 border-t border-forest/10 flex flex-col sm:flex-row gap-2 items-end">
          <div className="flex-1 space-y-1 w-full sm:w-auto">
            <Label className="text-[11px] text-charcoal-muted">Product Name</Label>
            <Input
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              placeholder="e.g. Pure Muga Silk Gamusa / Joha Rice 1kg"
              className="text-xs border-forest/20 h-9"
            />
          </div>
          <div className="w-full sm:w-28 space-y-1">
            <Label className="text-[11px] text-charcoal-muted">Price (₹)</Label>
            <Input
              type="number"
              value={newProductPrice}
              onChange={(e) => setNewProductPrice(e.target.value)}
              placeholder="e.g. 450"
              className="text-xs border-forest/20 h-9"
            />
          </div>
          <div className="w-full sm:w-28 space-y-1">
            <Label className="text-[11px] text-charcoal-muted">Unit</Label>
            <Input
              value={newProductUnit}
              onChange={(e) => setNewProductUnit(e.target.value)}
              placeholder="e.g. piece / kg / meter"
              className="text-xs border-forest/20 h-9"
            />
          </div>
          <Button
            type="button"
            onClick={handleAddProduct}
            variant="outline"
            size="sm"
            className="border-forest/30 text-forest hover:bg-forest/5 h-9 text-xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Product
          </Button>
        </div>
      </div>

      {/* 5. Professional Services & Labor Rates */}
      <div className="p-6 rounded-md bg-card border border-forest/15 shadow-sovereign-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-forest/10">
          <div>
            <h3 className="font-serif text-lg font-bold text-forest">
              5. Services & Labor Rates
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5">
              List bespoke services, repair work, or consultations you provide with clear labor rates.
            </p>
          </div>
          <Badge className="bg-sand/30 text-sand-800 border-sand/40 text-xs font-semibold">
            {servicesCatalog.length} Services
          </Badge>
        </div>

        {/* Existing Services */}
        <div className="space-y-2">
          {servicesCatalog.map((svc) => (
            <div
              key={svc.id}
              className="flex items-center justify-between p-3 rounded-sm border border-forest/15 bg-background text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-forest">{svc.name}</span>
                <span className="text-[11px] text-charcoal-muted">
                  ₹{svc.price} ({svc.priceType.replace("_", " ")})
                </span>
                {svc.durationEstimate && (
                  <span className="text-[10px] bg-forest/10 text-forest px-1.5 py-0.5 rounded">
                    {svc.durationEstimate}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveService(svc.id)}
                className="text-red-600 hover:text-red-800 p-1"
                aria-label="Remove service"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Service */}
        <div className="pt-2 border-t border-forest/10 flex flex-col sm:flex-row gap-2 items-end">
          <div className="flex-1 space-y-1 w-full sm:w-auto">
            <Label className="text-[11px] text-charcoal-muted">Service Title</Label>
            <Input
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              placeholder="e.g. Blouse Alteration / Inverter Safety Audit"
              className="text-xs border-forest/20 h-9"
            />
          </div>
          <div className="w-full sm:w-24 space-y-1">
            <Label className="text-[11px] text-charcoal-muted">Rate (₹)</Label>
            <Input
              type="number"
              value={newServicePrice}
              onChange={(e) => setNewServicePrice(e.target.value)}
              placeholder="e.g. 350"
              className="text-xs border-forest/20 h-9"
            />
          </div>
          <div className="w-full sm:w-28 space-y-1">
            <Label className="text-[11px] text-charcoal-muted">Pricing Model</Label>
            <select
              value={newServicePriceType}
              onChange={(e) => setNewServicePriceType(e.target.value as any)}
              className="w-full text-xs h-9 px-2 rounded-sm border border-forest/20 bg-background text-charcoal"
            >
              <option value="fixed">Fixed Rate</option>
              <option value="starting_from">Starting From</option>
              <option value="per_hour">Per Hour</option>
              <option value="per_day">Per Day</option>
            </select>
          </div>
          <div className="w-full sm:w-28 space-y-1">
            <Label className="text-[11px] text-charcoal-muted">Duration</Label>
            <Input
              value={newServiceDuration}
              onChange={(e) => setNewServiceDuration(e.target.value)}
              placeholder="e.g. 1-2 hours"
              className="text-xs border-forest/20 h-9"
            />
          </div>
          <Button
            type="button"
            onClick={handleAddService}
            variant="outline"
            size="sm"
            className="border-forest/30 text-forest hover:bg-forest/5 h-9 text-xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Service
          </Button>
        </div>
      </div>

      {/* 6. Workshop Photos & Showcase */}
      <div className="p-6 rounded-md bg-card border border-forest/15 shadow-sovereign-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-forest/10">
          <div>
            <h3 className="font-serif text-lg font-bold text-forest">
              6. Workshop & Storefront Photos
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Showcase authentic images of your physical shop, stall, or completed artisanal work.
            </p>
          </div>
          <Badge className="bg-forest/10 text-forest border-forest/20 text-xs">
            {businessImages.length} Photos
          </Badge>
        </div>

        {/* Existing Image Thumbnails */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {businessImages.map((url, idx) => (
            <div key={idx} className="relative group rounded border border-forest/20 overflow-hidden h-24 bg-forest/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1 right-1 bg-destructive-red text-white p-1 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                title="Remove photo"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Image URL */}
        <div className="flex gap-2 items-center pt-2 border-t border-forest/10">
          <Input
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Paste public photo URL (e.g. https://images.unsplash.com/...)"
            className="text-xs border-forest/20 h-9 flex-1"
          />
          <Button
            type="button"
            onClick={handleAddImage}
            variant="outline"
            size="sm"
            className="border-forest/30 text-forest text-xs h-9 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Photo
          </Button>
        </div>
      </div>

      {/* 7. Shop Location & Operating Hours */}
      <div className="p-6 rounded-md bg-card border border-forest/15 shadow-sovereign-sm space-y-4">
        <h3 className="font-serif text-lg font-bold text-forest pb-2 border-b border-forest/10">
          7. Location, Hours & Service Area
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-charcoal">State / UT *</Label>
            <Input
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g. Assam"
              required
              className="text-xs border-forest/20"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-charcoal">District *</Label>
            <Input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Kamrup Metropolitan"
              required
              className="text-xs border-forest/20"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-charcoal">City or Town *</Label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Guwahati"
              required
              className="text-xs border-forest/20"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold text-charcoal">Locality / Stall Address *</Label>
            <Input
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              placeholder="e.g. Shop No. 4, Paltan Bazaar Main Road"
              required
              className="text-xs border-forest/20"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-charcoal">PIN Code *</Label>
            <Input
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="e.g. 781001"
              maxLength={6}
              required
              className="text-xs border-forest/20 font-mono"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold text-charcoal">Operating Hours</Label>
            <Input
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              placeholder="e.g. 08:30 AM - 08:30 PM (Mon-Sat)"
              className="text-xs border-forest/20"
            />
          </div>

          <div className="space-y-1.5 flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="deliveryAvailable"
              checked={deliveryAvailable}
              onChange={(e) => setDeliveryAvailable(e.target.checked)}
              className="rounded border-forest/30 text-forest focus:ring-forest h-4 w-4"
            />
            <label htmlFor="deliveryAvailable" className="text-xs font-medium text-charcoal cursor-pointer">
              Provides Local Delivery to Doorstep
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons Bar: Save Draft vs Publish */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-forest/15">
        <Button
          type="button"
          variant="outline"
          onClick={handleSaveDraft}
          disabled={isSavingDraft || isSubmitting}
          className="border-forest/30 text-forest hover:bg-forest/5 text-xs font-semibold px-4 h-11"
        >
          <Save className="w-4 h-4 mr-1.5 text-forest" />
          {isSavingDraft ? "Saving Draft..." : "Save Draft & Continue Later"}
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting || isSavingDraft}
          className="bg-forest hover:bg-forest-600 text-ivory font-semibold px-8 h-11 text-sm shadow-sovereign-sm"
        >
          {isSubmitting ? (
            <span>Publishing Profile...</span>
          ) : (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 mr-1 text-sand" />
              Publish Profile (0% Commission)
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
