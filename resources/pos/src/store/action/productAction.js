import apiConfig from "../../config/apiConfigWthFormData";
import { apiBaseURL, productActionType, toastType } from "../../constants";
import { addToast } from "./toastAction";
import {
    setTotalRecord,
    addInToTotalRecord,
    removeFromTotalRecord,
} from "./totalRecordAction";
import requestParam from "../../shared/requestParam";
import { setLoading } from "./loadingAction";
import { getFormattedMessage } from "../../shared/sharedMethod";
import { setSavingButton } from "./saveButtonAction";
import { callImportProductApi } from "./importProductApiAction";
import apiConfigWthFormData from "../../config/apiConfigWthFormData";

export const fetchProducts =
    (filter = {}, isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            let url = apiBaseURL.PRODUCTS;
            if (
                !_.isEmpty(filter) &&
                (filter.page ||
                    filter.pageSize ||
                    filter.search ||
                    filter.order_By ||
                    filter.created_at)
            ) {
                url += requestParam(filter, null, null, null, url);
            }
            apiConfig
                .get(url)
                .then((response) => {
                    dispatch({
                        type: productActionType.FETCH_PRODUCTS,
                        payload: response.data.data,
                    });
                    dispatch(
                        setTotalRecord(
                            response.data.meta.total !== undefined &&
                                response.data.meta.total >= 0
                                ? response.data.meta.total
                                : response.data.data.total
                        )
                    );
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                })
                .catch(({ response }) => {
                    dispatch(
                        addToast({
                            text: response.data.message,
                            type: toastType.ERROR,
                        })
                    );
                });
        };

export const fetchProduct =
    (productId, singleProduct, isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            apiConfig
                .get(apiBaseURL.PRODUCTS + "/" + productId, singleProduct)
                .then((response) => {
                    dispatch({
                        type: productActionType.FETCH_PRODUCT,
                        payload: response.data.data,
                    });
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                })
                .catch(({ response }) => {
                    dispatch(
                        addToast({
                            text: response.data.message,
                            type: toastType.ERROR,
                        })
                    );
                });
        };

export const addProduct = (product, navigate) => async (dispatch) => {
    dispatch(setSavingButton(true));
    await apiConfig
        .post(apiBaseURL.PRODUCTS, product)
        .then((response) => {
            dispatch(fetchMainProduct(product.get('main_product_id'), false));
            dispatch(
                addToast({
                    text: getFormattedMessage("product.success.create.message"),
                })
            );
            dispatch(setSavingButton(false));
        })
        .catch(({ response }) => {
            dispatch(setSavingButton(false));
            dispatch(
                addToast({ text: response.data.message, type: toastType.ERROR })
            );
        });
};

export const editProduct =
    (productId, product, navigate) => async (dispatch) => {
        dispatch(setSavingButton(true));
        apiConfig
            .post(apiBaseURL.PRODUCTS + "/" + productId, product)
            .then((response) => {

                dispatch(fetchMainProduct(product.get('main_product_id'), false));
                dispatch(
                    addToast({
                        text: getFormattedMessage(
                            "product.success.edit.message"
                        ),
                    })
                );
                dispatch(setSavingButton(false));
            })
            .catch(({ response }) => {
                dispatch(setSavingButton(false));
                dispatch(
                    addToast({
                        text: response.data.message,
                        type: toastType.ERROR,
                    })
                );
            });
    };

export const deleteProduct = (productId, mainProductId) => async (dispatch) => {
    apiConfig
        .delete(apiBaseURL.PRODUCTS + "/" + productId)
        .then((response) => {
            dispatch(fetchMainProduct(mainProductId, false));
            // dispatch({
            //     type: productActionType.DELETE_PRODUCT,
            //     payload: productId,
            // });
            dispatch(
                addToast({
                    text: getFormattedMessage("product.success.delete.message"),
                })
            );
        })
        .catch(({ response }) => {
            dispatch(
                addToast({ text: response.data.message, type: toastType.ERROR })
            );
        });
};

export const fetchAllProducts = () => async (dispatch) => {
    apiConfig
        .get(`products?page[size]=0`)
        .then((response) => {
            dispatch({
                type: productActionType.FETCH_ALL_PRODUCTS,
                payload: response.data.data,
            });
        })
        .catch(({ response }) => {
            dispatch(
                addToast({ text: response.data.message, type: toastType.ERROR })
            );
        });
};

export const fetchProductsByWarehouse = (id) => async (dispatch) => {
    apiConfig
        .get(`products?page[size]=0&warehouse_id=${id}`)
        .then((response) => {
            dispatch({
                type: productActionType.FETCH_PRODUCTS_BY_WAREHOUSE,
                payload: response.data.data,
            });
        })
        .catch(({ response }) => {
            dispatch(
                addToast({ text: response.data.message, type: toastType.ERROR })
            );
        });
};

export const addImportProduct = (importProduct) => async (dispatch) => {
    await apiConfig
        .post(apiBaseURL.IMPORT_PRODUCT, importProduct)
        .then((response) => {
            dispatch(setLoading(false));
            dispatch(callImportProductApi(true));
            // dispatch({type: productActionType.ADD_IMPORT_PRODUCT, payload: response.data.data});
            dispatch(addToast({ text: "Product Import Create Success " }));
            dispatch(addInToTotalRecord(1));
        })
        .catch(({ response }) => {
            dispatch(
                addToast({ text: response.data.message, type: toastType.ERROR })
            );
        });
};
export const fetchAllMainProducts = (filter = {}, isLoading = true) => async (dispatch) => {
    if (isLoading) {
        dispatch(setLoading(true));
    }
    let url = apiBaseURL.MAIN_PRODUCTS;
    if (
        !_.isEmpty(filter) &&
        (filter.page ||
            filter.pageSize ||
            filter.search ||
            filter.order_By ||
            filter.created_at)
    ) {
        url += requestParam(filter, null, null, null, url);
    }

    apiConfig
        .get(url)
        .then((response) => {
            dispatch({
                type: productActionType.FETCH_ALL_MAIN_PRODUCTS,
                payload: response.data.data,
            });

            dispatch(
                setTotalRecord(
                    response.data.meta.total !== undefined &&
                        response.data.meta.total >= 0
                        ? response.data.meta.total
                        : response.data.data.total
                )
            );
            if (isLoading) {
                dispatch(setLoading(false));
            }
        })
        .catch(({ response }) => {
            dispatch(
                addToast({ text: response.data.message, type: toastType.ERROR })
            );
        });
};

export const fetchLastSalePrice = (productId, customerId) => async (dispatch) => {
    dispatch(setLoading(true));
    apiConfigWthFormData.get(`/products/${productId}/customers/${customerId}/last-sale-price`)
        .then((response) => {
            dispatch({
                type: productActionType.FETCH_LAST_SALE_PRICE,
                payload: { productId, customerId, price: response.data.data }
            });
            dispatch(setLoading(false));
        })
        .catch(({ response }) => {
            dispatch(addToast({ text: response ? response.data.message : 'Error fetching last sale price.', type: toastType.ERROR }));
            dispatch(setLoading(false));
        });
};

export const deleteMainProduct = (productId) => async (dispatch) => {
    apiConfig
        .delete(apiBaseURL.MAIN_PRODUCTS + "/" + productId)
        .then((response) => {
            dispatch(removeFromTotalRecord(1));
            dispatch({
                type: productActionType.DELETE_MAIN_PRODUCT,
                payload: productId,
            });
            dispatch(
                addToast({
                    text: getFormattedMessage("product.success.delete.message"),
                })
            );
        })
        .catch(({ response }) => {
            dispatch(
                addToast({ text: response.data.message, type: toastType.ERROR })
            );
        });
};

export const fetchMainProduct =
    (productId, isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            apiConfig
                .get(apiBaseURL.MAIN_PRODUCTS + "/" + productId)
                .then((response) => {
                    dispatch({
                        type: productActionType.FETCH_MAIN_PRODUCT,
                        payload: response.data.data,
                    });
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                })
                .catch(({ response }) => {
                    dispatch(
                        addToast({
                            text: response.data.message,
                            type: toastType.ERROR,
                        })
                    );
                });
        };

export const addMainProduct = (product, navigate) => async (dispatch) => {
    dispatch(setSavingButton(true));
    await apiConfig
        .post(apiBaseURL.MAIN_PRODUCTS, product)
        .then((response) => {
            dispatch({
                type: productActionType.ADD_MAIN_PRODUCT,
                payload: response.data.data,
            });
            dispatch(
                addToast({
                    text: getFormattedMessage("product.success.create.message"),
                })
            );
            navigate("/app/products");
            dispatch(addInToTotalRecord(1));
            dispatch(setSavingButton(false));
        })
        .catch(({ response }) => {
            dispatch(setSavingButton(false));
            dispatch(
                addToast({ text: response.data.message, type: toastType.ERROR })
            );
        });
};

export const editMainProduct = (productId, product, navigate) => async (dispatch) => {
    dispatch(setSavingButton(true));
    apiConfig
        .post(apiBaseURL.MAIN_PRODUCTS + "/" + productId, product)
        .then((response) => {
            navigate("/app/products");
            dispatch(
                addToast({
                    text: getFormattedMessage(
                        "product.success.edit.message"
                    ),
                })
            );
            dispatch(setSavingButton(false));
        })
        .catch(({ response }) => {
            dispatch(setSavingButton(false));
            dispatch(
                addToast({
                    text: response.data.message,
                    type: toastType.ERROR,
                })
            );
        });
}
