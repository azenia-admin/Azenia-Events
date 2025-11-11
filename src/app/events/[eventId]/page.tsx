import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EventOverviewPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the overview page for your event. You can see a summary of your event's performance here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
