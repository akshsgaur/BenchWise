import { ArrowLeft, Bell, Shield, CreditCard, Globe, Mail, Phone } from 'lucide-react';
import { useApp } from './AppContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';

export function SubscriptionSettings() {
  const { goBack } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Subscription Settings</h1>
            <p className="text-gray-600">Manage your subscription preferences and notifications</p>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-600">Receive email updates about your subscriptions</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Payment Reminders</Label>
              <p className="text-sm text-gray-600">Get notified before upcoming payments</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Billing Alerts</Label>
              <p className="text-sm text-gray-600">Alerts for failed payments and billing issues</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Usage Summaries</Label>
              <p className="text-sm text-gray-600">Monthly usage reports and statistics</p>
            </div>
            <Switch />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Promotional Offers</Label>
              <p className="text-sm text-gray-600">Special deals and subscription offers</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Billing Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Billing Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Renewal</Label>
              <p className="text-sm text-gray-600">Automatically renew subscriptions when they expire</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Smart Billing</Label>
              <p className="text-sm text-gray-600">Optimize payment dates across subscriptions</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Payment Retry</Label>
              <p className="text-sm text-gray-600">Automatically retry failed payments</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Invoice Generation</Label>
              <p className="text-sm text-gray-600">Generate detailed invoices for each payment</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Spending Alerts</Label>
              <p className="text-sm text-gray-600">Get notified when spending exceeds thresholds</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Device Monitoring</Label>
              <p className="text-sm text-gray-600">Monitor login attempts from new devices</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Privacy Mode</Label>
              <p className="text-sm text-gray-600">Hide subscription details in shared views</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Contact Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Contact & Regional Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Primary Email</Label>
                <div className="flex items-center mt-2 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm">akshit@example.com</span>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    Change
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Phone Number</Label>
                <div className="flex items-center mt-2 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    Change
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Currency</Label>
                <div className="flex items-center mt-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">USD - US Dollar</span>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    Change
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Time Zone</Label>
                <div className="flex items-center mt-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">PST - Pacific Standard Time</span>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    Change
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline">Reset to Defaults</Button>
        <div className="space-x-3">
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}