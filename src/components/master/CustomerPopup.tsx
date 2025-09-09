import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiService, Customer, CustomerCreateRequest } from "@/services/api";
import { Country, State, City } from 'country-state-city';

interface CustomerPopupProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: Customer | null;
  onSave: (customer: Customer) => void;
  onUpdate: (customer: Customer) => void;
}

interface FormData {
  client_name: string;
  email: string;
  mobile_no: string;
  address: string;
  pincode: string;
  country: string;
  state: string;
  city: string;
  pan_no: string;
  gst_no: string;
  aadhaar_number: string;
}

interface FormErrors {
  client_name?: string;
  email?: string;
  mobile_no?: string;
  address?: string;
  pincode?: string;
  country?: string;
  state?: string;
  city?: string;
  pan_no?: string;
  gst_no?: string;
  aadhaar_number?: string;
}

const CustomerPopup: React.FC<CustomerPopupProps> = ({
  isOpen,
  onClose,
  editingItem,
  onSave,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<FormData>({
    client_name: '',
    email: '',
    mobile_no: '',
    address: '',
    pincode: '',
    country: '',
    state: '',
    city: '',
    pan_no: '',
    gst_no: '',
    aadhaar_number: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [countries] = useState(Country.getAllCountries());
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);

  // Reset form when popup opens/closes or editing item changes
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setFormData({
          client_name: editingItem.client_name,
          email: editingItem.email,
          mobile_no: editingItem.mobile_no,
          address: editingItem.address,
          pincode: editingItem.pincode,
          country: editingItem.country,
          state: editingItem.state,
          city: editingItem.city,
          pan_no: editingItem.pan_no,
          gst_no: editingItem.gst_no,
          aadhaar_number: editingItem.aadhaar_number,
        });
        
        // Set selected country and load states
        const country = countries.find(c => c.name === editingItem.country);
        if (country) {
          setSelectedCountry(country);
          const countryStates = State.getStatesOfCountry(country.isoCode);
          setStates(countryStates);
          
          // Set selected state and load cities
          const state = countryStates.find(s => s.name === editingItem.state);
          if (state) {
            setSelectedState(state);
            const stateCities = City.getCitiesOfState(country.isoCode, state.isoCode);
            setCities(stateCities);
          }
        }
      } else {
        setFormData({
          client_name: '',
          email: '',
          mobile_no: '',
          address: '',
          pincode: '',
          country: '',
          state: '',
          city: '',
          pan_no: '',
          gst_no: '',
          aadhaar_number: '',
        });
        setSelectedCountry(null);
        setSelectedState(null);
        setStates([]);
        setCities([]);
      }
      setErrors({});
    }
  }, [isOpen, editingItem, countries]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCountryChange = (countryName: string) => {
    const country = countries.find(c => c.name === countryName);
    if (country) {
      setSelectedCountry(country);
      setFormData(prev => ({ ...prev, country: countryName, state: '', city: '' }));
      
      const countryStates = State.getStatesOfCountry(country.isoCode);
      setStates(countryStates);
      setSelectedState(null);
      setCities([]);
    }
  };

  const handleStateChange = (stateName: string) => {
    if (selectedCountry) {
      const state = states.find(s => s.name === stateName);
      if (state) {
        setSelectedState(state);
        setFormData(prev => ({ ...prev, state: stateName, city: '' }));
        
        const stateCities = City.getCitiesOfState(selectedCountry.isoCode, state.isoCode);
        setCities(stateCities);
      }
    }
  };

  const handleCityChange = (cityName: string) => {
    setFormData(prev => ({ ...prev, city: cityName }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.client_name.trim()) {
      newErrors.client_name = 'Client name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.mobile_no.trim()) {
      newErrors.mobile_no = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobile_no.replace(/\D/g, ''))) {
      newErrors.mobile_no = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.pan_no.trim()) {
      newErrors.pan_no = 'PAN number is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_no.toUpperCase())) {
      newErrors.pan_no = 'Please enter a valid PAN number (e.g., ABCDE1234F)';
    }

    if (!formData.gst_no.trim()) {
      newErrors.gst_no = 'GST number is required';
    } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst_no.toUpperCase())) {
      newErrors.gst_no = 'Please enter a valid GST number';
    }

    if (!formData.aadhaar_number.trim()) {
      newErrors.aadhaar_number = 'Aadhaar number is required';
    } else if (!/^[0-9]{12}$/.test(formData.aadhaar_number.replace(/\D/g, ''))) {
      newErrors.aadhaar_number = 'Please enter a valid 12-digit Aadhaar number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const customerData: CustomerCreateRequest = {
        ...formData,
        pan_no: formData.pan_no.toUpperCase(),
        gst_no: formData.gst_no.toUpperCase(),
      };

      if (editingItem) {
        const response = await apiService.updateCustomer(editingItem.id, customerData);
        if (response.success && response.data) {
          onUpdate(response.data.data);
          onClose();
          window.location.reload();
        }
      } else {
        const response = await apiService.createCustomer(customerData);
        if (response.success && response.data) {
          onSave(response.data.data);
          onClose();
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Edit Customer' : 'Add New Customer'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Client Name */}
          <div className="space-y-2">
            <Label htmlFor="client_name">Client Name *</Label>
            <Input
              id="client_name"
              value={formData.client_name}
              onChange={(e) => handleInputChange('client_name', e.target.value)}
              placeholder="Enter client name"
              className={errors.client_name ? 'border-red-500' : ''}
            />
            {errors.client_name && (
              <p className="text-sm text-red-500">{errors.client_name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Mobile Number */}
          <div className="space-y-2">
            <Label htmlFor="mobile_no">Mobile Number *</Label>
            <Input
              id="mobile_no"
              value={formData.mobile_no}
              onChange={(e) => handleInputChange('mobile_no', e.target.value)}
              placeholder="Enter mobile number"
              className={errors.mobile_no ? 'border-red-500' : ''}
            />
            {errors.mobile_no && (
              <p className="text-sm text-red-500">{errors.mobile_no}</p>
            )}
          </div>

          {/* Pincode */}
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode *</Label>
            <Input
              id="pincode"
              value={formData.pincode}
              onChange={(e) => handleInputChange('pincode', e.target.value)}
              placeholder="Enter pincode"
              className={errors.pincode ? 'border-red-500' : ''}
            />
            {errors.pincode && (
              <p className="text-sm text-red-500">{errors.pincode}</p>
            )}
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Select value={formData.country} onValueChange={handleCountryChange}>
              <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.isoCode} value={country.name}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-sm text-red-500">{errors.country}</p>
            )}
          </div>

          {/* State */}
          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Select 
              value={formData.state} 
              onValueChange={handleStateChange}
              disabled={!selectedCountry}
            >
              <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state.isoCode} value={state.name}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.state && (
              <p className="text-sm text-red-500">{errors.state}</p>
            )}
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Select 
              value={formData.city} 
              onValueChange={handleCityChange}
              disabled={!selectedState}
            >
              <SelectTrigger className={errors.city ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.name} value={city.name}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.city && (
              <p className="text-sm text-red-500">{errors.city}</p>
            )}
          </div>

          {/* PAN Number */}
          <div className="space-y-2">
            <Label htmlFor="pan_no">PAN Number *</Label>
            <Input
              id="pan_no"
              value={formData.pan_no}
              onChange={(e) => handleInputChange('pan_no', e.target.value.toUpperCase())}
              placeholder="Enter PAN number (e.g., ABCDE1234F)"
              className={errors.pan_no ? 'border-red-500' : ''}
            />
            {errors.pan_no && (
              <p className="text-sm text-red-500">{errors.pan_no}</p>
            )}
          </div>

          {/* GST Number */}
          <div className="space-y-2">
            <Label htmlFor="gst_no">GST Number *</Label>
            <Input
              id="gst_no"
              value={formData.gst_no}
              onChange={(e) => handleInputChange('gst_no', e.target.value.toUpperCase())}
              placeholder="Enter GST number"
              className={errors.gst_no ? 'border-red-500' : ''}
            />
            {errors.gst_no && (
              <p className="text-sm text-red-500">{errors.gst_no}</p>
            )}
          </div>

          {/* Aadhaar Number */}
          <div className="space-y-2">
            <Label htmlFor="aadhaar_number">Aadhaar Number *</Label>
            <Input
              id="aadhaar_number"
              value={formData.aadhaar_number}
              onChange={(e) => handleInputChange('aadhaar_number', e.target.value)}
              placeholder="Enter Aadhaar number"
              className={errors.aadhaar_number ? 'border-red-500' : ''}
            />
            {errors.aadhaar_number && (
              <p className="text-sm text-red-500">{errors.aadhaar_number}</p>
            )}
          </div>

          {/* Address - Full Width */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter complete address"
              className={errors.address ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : editingItem ? 'Update Customer' : 'Add Customer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerPopup;