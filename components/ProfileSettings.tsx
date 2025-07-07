"use client";

import type React from "react";
import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Camera, Loader2, Save, User } from "lucide-react";

export default function ProfileSettings() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setAlert({ type: "error", message: "Please select a valid image file" });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setAlert({
        type: "error",
        message: "Image size should be less than 2MB",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64String = e.target?.result as string;
      setLoading(true);
      setAlert(null);

      try {
        const result = await updateProfile({ profilePicture: base64String });
        if (result.success) {
          setAlert({
            type: "success",
            message: "Profile picture updated successfully!",
          });
        } else {
          setAlert({
            type: "error",
            message: result.error || "Failed to update profile picture",
          });
        }
      } catch (error) {
        setAlert({
          type: "error",
          message: "Failed to update profile picture",
        });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === user?.name) return;

    setLoading(true);
    setAlert(null);

    try {
      const result = await updateProfile({ name: name.trim() });
      if (result.success) {
        setAlert({ type: "success", message: "Name updated successfully!" });
      } else {
        setAlert({
          type: "error",
          message: result.error || "Failed to update name",
        });
      }
    } catch (error) {
      setAlert({ type: "error", message: "Failed to update name" });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Settings
        </CardTitle>
        <CardDescription>Update your profile information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {alert && (
          <Alert variant={alert.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        {/* Profile Picture Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="border-4 border-background shadow-lg">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user?.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="flex items-center justify-center w-full h-full text-2xl font-bold">
                  {user?.name ? getInitials(user.name) : "U"}
                </span>
              )}
            </Avatar>
            <Button
              size="sm"
              variant="secondary"
              className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <p className="text-sm text-muted-foreground text-center">
            Click the camera icon to change your profile picture
            <br />
            <span className="text-xs">Max size: 2MB</span>
          </p>
        </div>

        {/* Name Update Form */}
        <form onSubmit={handleNameUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              type="text"
              value={user?.role?.replace("_", " ")}
              disabled
              className="bg-muted"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || name.trim() === user?.name}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Name
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
