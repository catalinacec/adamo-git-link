import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Palette, Type, Upload, PenTool } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signature: string, type: 'draw' | 'type' | 'upload', options?: any) => void;
  onCancel: () => void;
}

const SignaturePad = ({ onSave, onCancel }: SignaturePadProps) => {
  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const [signatureText, setSignatureText] = useState('');
  const [fontFamily, setFontFamily] = useState('cursive');
  const [color, setColor] = useState('#000000');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fonts = [
    { value: 'cursive', label: 'Cursiva', style: 'cursive' },
    { value: 'serif', label: 'Serif', style: 'serif' },
    { value: 'sans-serif', label: 'Sans Serif', style: 'sans-serif' },
    { value: 'fantasy', label: 'Fantasía', style: 'fantasy' },
  ];

  const colors = [
    '#000000', '#1e40af', '#dc2626', '#059669', 
    '#7c3aed', '#ea580c', '#be185d', '#374151'
  ];

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const dataURL = canvas.toDataURL('image/png');
      onSave(dataURL, 'draw', { color });
    } else if (activeTab === 'type') {
      if (!signatureText.trim()) return;
      onSave(signatureText, 'type', { fontFamily, color });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onSave(result, 'upload', { color });
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Crear Firma</CardTitle>
        <CardDescription>
          Elige cómo quieres crear tu firma digital
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'draw' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('draw')}
          >
            <PenTool className="h-4 w-4 mr-2" />
            Dibujar
          </Button>
          <Button
            variant={activeTab === 'type' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('type')}
          >
            <Type className="h-4 w-4 mr-2" />
            Escribir
          </Button>
          <Button
            variant={activeTab === 'upload' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('upload')}
          >
            <Upload className="h-4 w-4 mr-2" />
            Subir
          </Button>
        </div>

        {/* Color Picker */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Color de firma
          </Label>
          <div className="flex gap-2">
            {colors.map((colorOption) => (
              <button
                key={colorOption}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  color === colorOption ? 'border-gray-400 scale-110' : 'border-gray-200'
                }`}
                style={{ backgroundColor: colorOption }}
                onClick={() => setColor(colorOption)}
              />
            ))}
          </div>
        </div>

        {/* Draw Tab */}
        {activeTab === 'draw' && (
          <div className="space-y-4">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="border border-gray-300 rounded-lg cursor-crosshair w-full"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            <Button variant="outline" onClick={clearCanvas} size="sm">
              Limpiar
            </Button>
          </div>
        )}

        {/* Type Tab */}
        {activeTab === 'type' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de letra</Label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fonts.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.style }}>{font.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Tu nombre</Label>
              <Input
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder="Escribe tu nombre completo"
              />
            </div>
            
            {signatureText && (
              <div className="p-4 border rounded-lg bg-gray-50">
                <p className="text-sm text-muted-foreground mb-2">Vista previa:</p>
                <div
                  style={{
                    fontFamily: fonts.find(f => f.value === fontFamily)?.style,
                    color,
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}
                >
                  {signatureText}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subir imagen de firma</Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Formatos soportados: PNG, JPG, JPEG. Tamaño máximo: 2MB
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={saveSignature}>
            Guardar Firma
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignaturePad;