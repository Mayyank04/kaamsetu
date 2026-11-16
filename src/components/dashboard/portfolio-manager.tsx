"use client";

import * as React from "react";
import Image from "next/image";
import {
  Briefcase,
  Upload,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Quote,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DashboardPortfolioItem } from "@/types/dashboard";

interface PortfolioManagerProps {
  portfolio: DashboardPortfolioItem[];
  workerProfileId: string;
  onAddPortfolioItem: (item: {
    title: string;
    description: string;
    imageUrl: string;
    category: string;
    projectDate: string;
    clientTestimony: string;
  }) => Promise<void>;
  onDeletePortfolioItem: (id: string) => Promise<void>;
}

export function PortfolioManager({
  portfolio,
  workerProfileId,
  onAddPortfolioItem,
  onDeletePortfolioItem,
}: PortfolioManagerProps) {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  // Form State
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("Commercial Solar");
  const [projectDate, setProjectDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = React.useState("");
  const [clientTestimony, setClientTestimony] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("workerProfileId", workerProfileId);

    try {
      const res = await fetch("/api/worker/portfolio/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to upload image");
      }

      setImageUrl(json.data.publicUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Error uploading image to Supabase Storage");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;

    setIsSubmitting(true);
    try {
      await onAddPortfolioItem({
        title,
        category,
        projectDate,
        description,
        clientTestimony,
        imageUrl,
      });

      // Reset
      setTitle("");
      setDescription("");
      setClientTestimony("");
      setImageUrl("");
      setShowAddModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-md bg-card border border-forest/15 shadow-sovereign-sm p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-forest/10">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-forest" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest">
              Craft Project Portfolio
            </h2>
          </div>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Photographic proof of your completed projects anchored directly to Supabase Storage.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="bg-forest hover:bg-forest-600 text-ivory text-xs h-9 px-4 self-start sm:self-auto shadow-sovereign-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Project to Portfolio
        </Button>
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-forest-950/75 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-xl rounded-md border border-forest/20 shadow-sovereign-md p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-forest/10">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-forest" />
                <h3 className="font-serif text-lg font-bold text-forest">
                  Add Completed Craft Project
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-charcoal-muted hover:text-forest p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload Area to Supabase Storage */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-forest uppercase tracking-wider block">
                  Project Image (Supabase Storage) *
                </label>

                {imageUrl ? (
                  <div className="relative h-44 w-full rounded-xl overflow-hidden border border-forest/20 bg-forest/5">
                    <Image
                      src={imageUrl}
                      alt="Uploaded preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1.5 hover:bg-black transition-colors"
                      title="Replace image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-36 w-full rounded-xl border-2 border-dashed border-forest/25 hover:border-forest/50 bg-forest/5 flex flex-col items-center justify-center cursor-pointer transition-colors p-4 text-center"
                  >
                    <Upload className="w-7 h-7 text-forest/60 mb-2" />
                    <span className="text-xs font-semibold text-forest">
                      {uploadingImage
                        ? "Uploading to Supabase Storage..."
                        : "Click to upload craft photo from device"}
                    </span>
                    <span className="text-[11px] text-charcoal-muted mt-1">
                      JPG, PNG, or WEBP up to 5MB
                    </span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {uploadError && (
                  <p className="text-xs text-terracotta flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {uploadError}
                  </p>
                )}
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-forest block">
                    Project Title *
                  </label>
                  <Input
                    placeholder="e.g. 50kW Hospital Solar Array"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="text-xs h-10 border-forest/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-forest block">
                    Trade Category
                  </label>
                  <Input
                    placeholder="e.g. Commercial Solar / Heavy Electrical"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="text-xs h-10 border-forest/20"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-forest block">
                  Completion Date
                </label>
                <Input
                  type="date"
                  value={projectDate}
                  onChange={(e) => setProjectDate(e.target.value)}
                  className="text-xs h-10 border-forest/20"
                />
              </div>

              {/* Technical Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-forest block">
                  Technical Execution Summary
                </label>
                <Textarea
                  placeholder="Describe the tools used, technical challenges overcome, or safety standards met..."
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                  className="text-xs min-h-[70px] border-forest/20 resize-none"
                />
              </div>

              {/* Client Quote */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-forest block">
                  Client or Contractor Endorsement (Optional)
                </label>
                <Input
                  placeholder="e.g. 'Rameshwar completed the wiring ahead of deadline with zero faults.'"
                  value={clientTestimony}
                  onChange={(e) => setClientTestimony(e.target.value)}
                  className="text-xs h-10 border-forest/20"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-forest/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs h-9 border-forest/20 text-forest"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !title || !imageUrl}
                  className="bg-forest hover:bg-forest-600 text-ivory text-xs h-9 px-5 shadow-sovereign-xs font-semibold"
                >
                  {isSubmitting ? "Anchoring..." : "Save to Portfolio"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {portfolio.map((item) => (
          <div
            key={item.id}
            className="group rounded-xl overflow-hidden border border-forest/15 bg-card hover:border-forest/35 shadow-sovereign-xs hover:shadow-sovereign-sm transition-all flex flex-col justify-between"
          >
            {/* Image */}
            <div className="relative h-44 w-full bg-forest-900 overflow-hidden">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute top-2.5 left-2.5 bg-forest-950 text-sand px-2.5 py-0.5 rounded text-[10px] font-mono border border-sand/30">
                {item.category || "Craft Project"}
              </div>

              <button
                onClick={() => onDeletePortfolioItem(item.id)}
                className="absolute top-2.5 right-2.5 bg-terracotta/90 hover:bg-terracotta text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
                title="Delete portfolio project"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-serif font-bold text-sm text-forest line-clamp-1">
                  {item.title}
                </h4>

                {item.projectDate && (
                  <div className="flex items-center gap-1.5 text-[11px] text-charcoal-muted font-mono mt-0.5">
                    <Calendar className="w-3 h-3 text-forest/70" />
                    <span>
                      {new Date(item.projectDate).toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}

                {item.description && (
                  <p className="text-xs text-charcoal-muted mt-2 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              {item.clientTestimony && (
                <div className="mt-3 p-2.5 rounded-lg bg-forest/5 border border-forest/10 flex items-start gap-2 text-[11px] text-forest/90 italic">
                  <Quote className="w-3.5 h-3.5 text-sand-600 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{item.clientTestimony}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
