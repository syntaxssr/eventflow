import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/** โครงหน้า Dashboard ระหว่างรอข้อมูล — สัดส่วนตรงกับเนื้อหาจริงเพื่อลดการกระตุก */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="flex items-center gap-3 p-4">
                  <Skeleton className="size-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="overflow-hidden pt-0">
            <Skeleton className="h-36 w-full rounded-none sm:h-44" />
            <CardContent className="space-y-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>

        {/* ปฏิทิน — หัวเดือน, ตารางวัน 5 แถว, แล้วรายการของวันที่เลือก */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: 35 }).map((_, index) => (
                <Skeleton key={index} className="aspect-square rounded-md" />
              ))}
            </div>
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>

      {/* แท็บข้อมูลประกอบ — แถบแท็บ 1 แถว ตามด้วยการ์ดเนื้อหาใบเดียว */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-full max-w-md rounded-lg" />
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="mx-auto size-36 rounded-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
