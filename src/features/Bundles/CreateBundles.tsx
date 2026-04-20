import React from 'react';
import { Form } from 'react-hook-form';
import { View, Text, TextInput, Button   } from 'react-native';
import { ref, push } from 'firebase/database';
import { db } from '@/src/firebaseConfig';
export default function CreateBundles() {
    const [items, setItems]: any[] = React.useState([]);
    const [bundleName, setBundleName]: any = React.useState('');
    const [itemName, setItemName]: any = React.useState('');
    const [itemPrice, setItemPrice]: any = React.useState('');
    const [itemCurrency, setItemCurrency]: any = React.useState('');

    const calculateTotalPrice = () => {
        let total = 0;
        items.forEach((item: any) => {
            total += parseFloat(item.price) || 0;
        });
        return total;
    };

    const handleAddItem = () => {
        if (!itemName || !itemPrice) return;
        setItems([...items, { name: itemName, price: itemPrice, currency: itemCurrency }]);
        setItemName('');
        setItemPrice('');
        setItemCurrency('');
    };

    const handleCreateBundle = () => {
        if (!bundleName) return;
        push(ref(db, 'Bundles'), {
            name: bundleName,
            items: items,
            totalPrice: calculateTotalPrice()
        });
        setItems([]);
        setBundleName('');
    };

    return (
        <View style={{ padding: 16 }}>
            <TextInput style={{ borderBottomWidth: 1, marginBottom: 10 }} placeholder="Bundle Name" value={bundleName} onChangeText={setBundleName} />
            <View style={{ marginBottom: 20, padding: 10, backgroundColor: '#f0f0f0' }}>
                <Text style={{ fontWeight: 'bold' }}>Add Items</Text>
                <TextInput style={{ borderBottomWidth: 1, marginBottom: 5 }} placeholder="Item Name" value={itemName} onChangeText={setItemName} />
                <TextInput style={{ borderBottomWidth: 1, marginBottom: 5 }} placeholder="Item Price" value={itemPrice} onChangeText={setItemPrice} keyboardType="numeric" />
                <TextInput style={{ borderBottomWidth: 1, marginBottom: 10 }} placeholder="Item Currency (e.g. $)" value={itemCurrency} onChangeText={setItemCurrency} />
                <Button title="Add Item to Bundle" onPress={handleAddItem} />
            </View>

            <View style={{ marginTop: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>Items in this bundle:</Text>
                {items.map((item: any, index: number) => (
                    <Text key={index}>{item.name}: {item.price} {item.currency}</Text>
                ))}
            </View>

            <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Total: {calculateTotalPrice()}</Text>
                <Button title="Create Bundle" onPress={handleCreateBundle} disabled={!bundleName || items.length === 0} />
            </View>
        </View>
    );
}
