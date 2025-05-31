import React from "react";
import { Button } from "react-bootstrap-v5";
import { connect, useDispatch, useSelector } from "react-redux";
import {
    currencySymbolHandling,
    decimalValidate,
    getFormattedMessage,
} from "../../../shared/sharedMethod";
import { calculateProductCost } from "../../shared/SharedMethod";
import { addToast } from "../../../store/action/toastAction";
import { toastType } from "../../../constants";

const ProductCartList = (props) => {
    const {
        singleProduct,
        index,
        onClickUpdateItemInCart,
        onDeleteCartItem,
        frontSetting,
        setUpdateProducts,
        posAllProducts,
        allConfigData,
        customerId, // Added customerId prop
    } = props;
    const dispatch = useDispatch();
    const { lastSalePrices } = useSelector(state => state.products); // Assuming 'products' is the key for product reducer

    const totalQty = posAllProducts
        .filter((product) => product.id === singleProduct.id)
        .map((product) => product.attributes.stock.quantity);

    const handleIncrement = () => {
        setUpdateProducts((updateProducts) =>
            updateProducts.map((item) => {
                if (item.id === singleProduct.id) {
                    if (item.quantity >= totalQty[0]) {
                        dispatch(
                            addToast({
                                text: getFormattedMessage(
                                    "pos.product-quantity-error.message"
                                ),
                                type: toastType.ERROR,
                            })
                        );
                        return item;
                    } else {
                        return { ...item, quantity: item.quantity++ + 1 };
                    }
                } else {
                    return item;
                }
            })
        );
    };

    const handleDecrement = () => {
        if (singleProduct.quantity - 1 > 0.0) {
            setUpdateProducts((updateProducts) =>
                updateProducts.map((item) =>
                    item.id === singleProduct.id
                        ? { ...item, quantity: item.quantity-- - 1 }
                        : item
                )
            );
        }
    };

    //qty onChange
    const handleChange = (e) => {
        e.preventDefault();
        const { value } = e.target;
        // check if value includes a decimal point
        if (value.match(/\./g)) {
            const [, decimal] = value.split(".");
            // restrict value to only 2 decimal places
            if (decimal?.length > 2) {
                // do nothing
                return;
            }
        }

        setUpdateProducts((updateProducts) =>
            updateProducts.map((item) => {
                if (item.id === singleProduct.id) {
                    if (totalQty[0] < Number(e.target.value)) {
                        dispatch(
                            addToast({
                                text: getFormattedMessage(
                                    "pos.product-quantity-error.message"
                                ),
                                type: toastType.ERROR,
                            })
                        );
                        return { ...item, quantity: totalQty[0] };
                    } else {
                        return {
                            ...item,
                            quantity: Number(e.target.value),
                        };
                    }
                } else {
                    return item;
                }
            })
        );
    };

    return (
        <tr key={index} className="align-middle">
            <td className="text-nowrap text-nowrap ps-0">
                <h4 className="product-name text-gray-900 mb-1 text-capitalize text-truncate">
                    {singleProduct.name}
                </h4>
                <span className="product-sku">
                    <span className="badge bg-light-info sku-badge">
                        {singleProduct.code}
                    </span>
                    <i
                        className="bi bi-pencil-fill text-gray-600 ms-2 cursor-pointer fs-small"
                        onClick={() => onClickUpdateItemInCart(singleProduct)}
                    />
                </span>
                {customerId && lastSalePrices && lastSalePrices[`${singleProduct.id}_${customerId}`] !== undefined && (
                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        {lastSalePrices[`${singleProduct.id}_${customerId}`] === null
                            ? <span className="text-muted">{getFormattedMessage("pos.no-previous-price.label")}</span>
                            : <span className="text-success">
                                {getFormattedMessage("pos.last-price.label")}: {currencySymbolHandling(allConfigData, frontSetting.value?.currency_symbol, lastSalePrices[`${singleProduct.id}_${customerId}`])}
                              </span>
                        }
                    </div>
                )}
            </td>
            <td>
                <div className="counter d-flex align-items-center pos-custom-qty">
                    <Button
                        type="button"
                        variant="primary"
                        onClick={() => handleDecrement()}
                        className="counter__down d-flex align-items-center justify-content-center"
                    >
                        -
                    </Button>
                    <input
                        type="number"
                        value={singleProduct.quantity}
                        className="hide-arrow"
                        onKeyPress={(event) => decimalValidate(event)}
                        onChange={(e) => handleChange(e)}
                    />
                    <Button
                        type="button"
                        variant="primary"
                        onClick={() => handleIncrement()}
                        className="counter__up d-flex align-items-center justify-content-center"
                    >
                        +
                    </Button>
                </div>
            </td>
            <td className="text-nowrap">
                {currencySymbolHandling(
                    allConfigData,
                    frontSetting.value && frontSetting.value.currency_symbol,
                    calculateProductCost(singleProduct)
                )}
            </td>
            <td className="text-nowrap">
                {currencySymbolHandling(
                    allConfigData,
                    frontSetting.value && frontSetting.value.currency_symbol,
                    calculateProductCost(singleProduct) * singleProduct.quantity
                )}
            </td>
            <td className="text-end remove-button pe-0">
                <Button
                    className="p-0 bg-transparent border-0"
                    onClick={() => onDeleteCartItem(singleProduct.id)}
                >
                    <i className="bi bi-trash3 text-danger" />
                </Button>
            </td>
        </tr>
    );
};

export default connect(null, null)(ProductCartList);
