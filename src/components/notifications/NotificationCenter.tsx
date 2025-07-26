import { useState } from 'react';
import { Bell, X, Check, Filter, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotifications, NotificationType } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const {
    notifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  } = useNotifications();
  
  const [selectedFilter, setSelectedFilter] = useState<NotificationType | 'all'>('all');
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = getUnreadCount();
  
  const filteredNotifications = notifications.filter(notification => 
    selectedFilter === 'all' || notification.type === selectedFilter
  );

  const getNotificationIcon = (type: NotificationType) => {
    const iconClasses = "w-4 h-4";
    switch (type) {
      case 'success':
        return <Check className={cn(iconClasses, "text-green-600")} />;
      case 'error':
        return <X className={cn(iconClasses, "text-red-600")} />;
      case 'warning':
        return <Bell className={cn(iconClasses, "text-yellow-600")} />;
      case 'info':
      default:
        return <Bell className={cn(iconClasses, "text-blue-600")} />;
    }
  };

  const getNotificationBg = (type: NotificationType, read: boolean) => {
    const baseClasses = read ? 'opacity-60' : '';
    switch (type) {
      case 'success':
        return cn('border-l-4 border-l-green-500 bg-green-50/50', baseClasses);
      case 'error':
        return cn('border-l-4 border-l-red-500 bg-red-50/50', baseClasses);
      case 'warning':
        return cn('border-l-4 border-l-yellow-500 bg-yellow-50/50', baseClasses);
      case 'info':
      default:
        return cn('border-l-4 border-l-blue-500 bg-blue-50/50', baseClasses);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("relative", className)}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 p-0" 
        align="end"
        sideOffset={4}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notificações</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Marcar todas como lidas
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <Badge variant="secondary" className="w-fit">
                {unreadCount} não lidas
              </Badge>
            )}
          </CardHeader>
          
          <Separator />
          
          <CardContent className="p-0">
            <Tabs value={selectedFilter} onValueChange={(value) => setSelectedFilter(value as any)}>
              <TabsList className="grid w-full grid-cols-5 rounded-none border-b">
                <TabsTrigger value="all" className="text-xs">Todas</TabsTrigger>
                <TabsTrigger value="success" className="text-xs">Sucesso</TabsTrigger>
                <TabsTrigger value="error" className="text-xs">Erro</TabsTrigger>
                <TabsTrigger value="warning" className="text-xs">Aviso</TabsTrigger>
                <TabsTrigger value="info" className="text-xs">Info</TabsTrigger>
              </TabsList>
              
              <TabsContent value={selectedFilter} className="mt-0">
                <ScrollArea className="h-96">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma notificação</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            'p-3 cursor-pointer transition-colors hover:bg-muted/50',
                            getNotificationBg(notification.type, notification.read)
                          )}
                          onClick={() => !notification.read && markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className={cn(
                                  "text-sm font-medium truncate",
                                  !notification.read && "font-semibold"
                                )}>
                                  {notification.title}
                                </h4>
                                
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeNotification(notification.id);
                                    }}
                                    className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              {notification.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {notification.description}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(notification.timestamp, {
                                    addSuffix: true,
                                    locale: ptBR
                                  })}
                                </span>
                                
                                {notification.action && (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      notification.action?.onClick();
                                    }}
                                    className="text-xs h-auto p-0"
                                  >
                                    {notification.action.label}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

// Compact notification bell for mobile/header use
export function NotificationBell({ className }: { className?: string }) {
  const { getUnreadCount } = useNotifications();
  const unreadCount = getUnreadCount();

  return (
    <div className={cn("relative", className)}>
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 w-4 h-4 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </div>
  );
}