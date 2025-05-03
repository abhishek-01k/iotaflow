import { Metadata } from "next";
import { VestingForm } from "@/components/vesting/vesting-form";
import { VestingList } from "@/components/vesting/vesting-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Vesting | IoTaFlow",
  description: "Manage token vesting schedules on the IOTA blockchain",
};

export default function VestingPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Token Vesting</h1>
        <p className="text-muted-foreground">
          Create and manage token vesting schedules for secure, transparent token distribution
        </p>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="manage">Manage</TabsTrigger>
        </TabsList>
        <TabsContent value="create" className="space-y-4">
          <div className="flex w-full flex-col items-center">
            <VestingForm />
          </div>
        </TabsContent>
        <TabsContent value="manage">
          <VestingList />
        </TabsContent>
      </Tabs>
    </div>
  );
} 