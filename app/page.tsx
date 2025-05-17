import { Tabs, TabsContent, TabsItem, TabsList } from "@/components/ui/tabs"
import FileUpload from "@/components/file-upload"
import FileList from "@/components/file-list"
import UserForm from "@/components/user-form"
import UserList from "@/components/user-list"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">AWS S3 & RDS Integration</h1>

      <Tabs defaultValue="files" className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsItem value="files">File Management</TabsItem>
          <TabsItem value="users">User Management</TabsItem>
        </TabsList>

        <TabsContent value="files" className="mt-6 space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Upload File to S3</h2>
            <FileUpload />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Files in S3 Bucket</h2>
            <FileList />
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6 space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <UserForm />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">User List</h2>
            <UserList />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}
