
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { BookOpen } from 'lucide-react';

const GuidesSection = () => {
  const [open, setOpen] = React.useState(false);
  const { t , language } = useLanguage();
console.log(language)
  return (
    <>
      <Button
      dir={language === 'en' ? 'ltr' : 'rtl'}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => setOpen(true)}
      >
        <BookOpen className="h-4 w-4" />
        {t.guides.title}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader dir={language === 'en' ? 'ltr' : 'rtl'} >
            <DialogTitle className={`${language === 'en' ? 'text-left' : 'text-center'}`}>{t.guides.title}</DialogTitle>
            <DialogDescription className={`${language === 'en' ? 'text-left' : 'text-right'}`}>
              {t.guides.introduction}
            </DialogDescription>
          </DialogHeader>
          
          <div dir={language === 'en' ? 'ltr' : 'rtl'} className={`space-y-4 my-4 ${language === 'en' ? 'text-left' : 'text-right'}`}>
            <div className="space-y-2">
              <h3 className="font-medium">{t.guides.objective}</h3>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">{t.guides.setup}</h3>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">{t.guides.movement}</h3>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">{t.guides.nextMove}</h3>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">{t.guides.winning}</h3>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>{t.buttons.close}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GuidesSection;
