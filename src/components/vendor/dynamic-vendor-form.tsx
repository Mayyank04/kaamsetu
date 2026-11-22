"use client";

import * as React from "react";
import {
  INDIAN_BUSINESS_CATEGORIES,
  BusinessCategory,
  BusinessSubcategory,
  DynamicFieldDefinition,
} from "@/lib/taxonomy/business-categories";
import { VendorProductItem, VendorStallType } from "@/types/vendor";
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
  Sparkles,
  ShieldAlert,
  Save,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface DynamicVendorFormProps {
  initialData?: any;
  onSuccess?: (vendorId: string) => void;
}

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
      { id: "item-1", name: "Standard Diagnostic Service", price: 500, unit: "visit", inStock: true },
    ]
  );
  const [newProductName, setNewProductName] = React.useState("");
  const [newProductPrice, setNewProductPrice] = React.useState("");
  const [newProductUnit, setNewProductUnit] = React.useState("item");

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const activeCategory: BusinessCategory | undefined = INDIAN_BUSINESS_CATEGORIES.find(
    (c) => c.code === selectedCategoryCode
  );
  const activeSubcategory: BusinessSubcategory | undefined = activeCategory?.subcategories.find(
    (s) => s.code === selectedSubcategoryCode
  ) || activeCategory?.subcategories[0];

  // Handle Dynamic Field Change
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

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      toast.error("Please enter your business or stall name");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        businessName,
        displayName: businessName,
        ownerName: ownerName || businessName,
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
        categoryAttributes,
      };

      const res = await fetch("/api/vendor/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save vendor profile");
      }

      toast.success("Vendor profile saved successfully!");
      if (onSuccess) onSuccess(data.vendorId);
    } catch (err: any) {
      toast.error(err.message || "Failed to save vendor profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Category Selection */}
      <div className="p-6 rounded-md bg-card border border-forest/15 shadow-sovereign-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-forest/10">
          <Store className="w-5 h-5 text-forest" />
          <h3 className="font-serif text-lg font-bold text-forest">
            {t.categories?.homeRepair ? "1. Select Business Category & Trade" : "1. Business Category"}
          </h3>
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
                <span className="block text-[10px] opacity-75 mt-0.5">{cat.hindiName}</span>
              </button>
            );
          })}
        </div>

        {/* Subcategories */}
        {activeCategory && activeCategory.subcategories.length > 0 && (
          <div className="pt-3 border-t border-forest/10 space-y-2">
            <Label className="text-xs font-semibold text-charcoal">Specific Trade / Business Type:</Label>
            <div className="flex flex-wrap gap-2">
              {activeCategory.subcategories.map((sub) => {
                const isSelected = selectedSubcategoryCode === sub.code;
                return (
                  <button
                    key={sub.code}
                    type="button"
                    onClick={() => setSelectedSubcategoryCode(sub.code)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-forest/10 text-forest border-forest font-bold"
                        : "bg-card text-charcoal-muted border-forest/15 hover:bg-forest/5"
                    }`}
                  >
                    {sub.name} ({sub.hindiName})
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Core Business Information */}
      <div className="p-6 rounded-md bg-card border border-forest/15 shadow-sovereign-sm space-y-4">
        <h3 className="font-serif text-lg font-bold text-forest pb-2 border-b border-forest/10">
          2. Store & Stall Setup
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-charcoal">
              {t.vendor?.businessName || "Business / Stall Name"} *
            </Label>
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Maa Kamakhya Tailors & Boutique"
              required
              className="text-xs border-forest/20"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-charcoal">Owner / Proprietor Name</Label>
            <Input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Enter your full name"
              className="text-xs border-forest/20"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-charcoal">
              {t.vendor?.stallType || "Stall Setup / Type"}
            </Label>
            <select
              value={stallType}
              onChange={(e) => setStallType(e.target.value as VendorStallType)}
              className="w-full h-9 rounded-sm border border-forest/20 bg-background px-3 text-xs text-charcoal outline-none"
            >
              <option value="fixed_stall">{t.vendor?.fixedStall || "Fixed Market Stall"}</option>
              <option value="mobile_cart">{t.vendor?.mobileCart || "Mobile Cart / Thela"}</option>
              <option value="home_workshop">{t.vendor?.homeWorkshop || "Home Workshop / Karkhana"}</option>
              <option value="street_kiosk">{t.vendor?.kiosk || "Street Kiosk / Khokha"}</option>
              <option value="retail_shop">Retail Shop / Counter</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-charcoal">
              {t.vendor?.operatingHours || "Operating Hours"}
            </Label>
            <Input
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              placeholder="e.g. 09:00 AM - 08:00 PM (Closed on Sun)"
              className="text-xs border-forest/20"
            />
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <Label className="text-xs font-semibold text-charcoal">Business Description</Label>
          <Textarea
            value={businessDescription}
            onChange={(e) => setBusinessDescription(e.target.value)}
            placeholder="Tell customers about your craftsmanship, years of service, materials used..."
            rows={3}
            className="text-xs border-forest/20 leading-relaxed"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="deliveryToggle"
            checked={deliveryAvailable}
            onChange={(e) => setDeliveryAvailable(e.target.checked)}
            className="w-4 h-4 rounded text-forest focus:ring-forest border-forest/30"
          />
          <Label htmlFor="deliveryToggle" className="text-xs font-medium text-charcoal cursor-pointer">
            {t.vendor?.deliveryAvailable || "Local doorstep delivery available within neighborhood"}
          </Label>
        </div>
      </div>

      {/* 3. Category-Specific Dynamic Fields */}
      {activeSubcategory && activeSubcategory.fields.length > 0 && (
        <div className="p-6 rounded-md bg-card border border-forest/15 shadow-sovereign-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-forest/10">
            <div>
              <h3 className="font-serif text-lg font-bold text-forest">
                3. {activeSubcategory.name} Specifications
              </h3>
              <p className="text-xs text-charcoal-muted mt-0.5">
                Specialized attributes helping customers discover your precise capabilities.
              </p>
            </div>
            {activeSubcategory.requiresLicense && (
              <Badge className="bg-sand/30 text-sand-800 border-sand/50 text-[10px] font-mono">
                REGULATED TRADE
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeSubcategory.fields.map((field) => {
              const val = categoryAttributes[field.id];

              if (field.type === "boolean") {
                return (
                  <div key={field.id} className="flex items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      id={field.id}
                      checked={Boolean(val)}
                      onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                      className="w-4 h-4 rounded text-forest focus:ring-forest border-forest/30"
                    />
                    <Label htmlFor={field.id} className="text-xs font-medium text-charcoal cursor-pointer">
                      {field.defaultLabel}
                    </Label>
                  </div>
                );
              }

              if (field.type === "select" && field.options) {
                return (
                  <div key={field.id} className="space-y-1.5">
                    <Label className="text-xs font-semibold text-charcoal">{field.defaultLabel}</Label>
                    <select
                      value={val || field.options[0]?.value}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-full h-9 rounded-sm border border-forest/20 bg-background px-3 text-xs text-charcoal outline-none"
                    >
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
              4. {t.vendor?.productsOffered || "Products & Goods Offered"}
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5">
              List individual items or standard services with transparent unit pricing.
            </p>
          </div>
          <Badge className="bg-forest/10 text-forest border-forest/20 text-xs">
            {productCatalog.length} Items Listed
          </Badge>
        </div>

        {/* Existing Items */}
        <div className="space-y-2">
          {productCatalog.map((prod) => (
            <div
              key={prod.id}
              className="flex items-center justify-between p-3 rounded-sm border border-forest/15 bg-background text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-forest">{prod.name}</span>
                <span className="text-[10px] text-charcoal-muted">
                  ₹{prod.price} / {prod.unit}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveProduct(prod.id)}
                className="text-red-600 hover:text-red-800 p-1"
                aria-label="Remove item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Item */}
        <div className="pt-2 border-t border-forest/10 flex flex-col sm:flex-row gap-2 items-end">
          <div className="flex-1 space-y-1 w-full sm:w-auto">
            <Label className="text-[11px] text-charcoal-muted">Item / Service Name</Label>
            <Input
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              placeholder="e.g. Cotton Kurti Stitching / Fresh Joha Rice"
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
              placeholder="e.g. piece / kg"
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
            Add Item
          </Button>
        </div>
      </div>

      {/* 5. Location Details */}
      <div className="p-6 rounded-md bg-card border border-forest/15 shadow-sovereign-sm space-y-4">
        <h3 className="font-serif text-lg font-bold text-forest pb-2 border-b border-forest/10">
          5. Stall & Shop Location
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
            <Label className="text-xs font-semibold text-charcoal">City, Town or Village *</Label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Guwahati"
              required
              className="text-xs border-forest/20"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold text-charcoal">Locality / Market Area *</Label>
            <Input
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              placeholder="e.g. Paltan Bazaar, Shop No 4"
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
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-forest hover:bg-forest-600 text-ivory font-semibold px-6 h-11 text-sm shadow-sovereign-sm"
        >
          {isSubmitting ? (
            <span>{t.actions?.loading || "Saving Profile..."}</span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Save className="w-4 h-4 mr-1 text-sand" />
              {t.actions?.save || "Save Vendor Profile"}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
