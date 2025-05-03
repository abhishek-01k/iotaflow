import { Metadata } from "next";
import { LockForm } from "@/components/lock/lock-form";
import { LockList } from "@/components/lock/lock-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Token Locks | IoTaFlow",
  description: "Lock and manage tokens on the IOTA blockchain",
};

export default function LocksPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Token Locks</h1>
        <p className="text-muted-foreground">
          Lock and manage tokens securely for a specified period
        </p>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="create">Create Lock</TabsTrigger>
          <TabsTrigger value="manage">Manage Locks</TabsTrigger>
        </TabsList>
        <TabsContent value="create" className="space-y-4">
          <div className="flex w-full flex-col items-center">
            <LockForm />
          </div>
        </TabsContent>
        <TabsContent value="manage">
          <LockList />
        </TabsContent>
      </Tabs>
    </div>
  );
} 