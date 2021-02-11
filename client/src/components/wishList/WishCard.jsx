import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import axios from 'axios';
import CardMedia from '@material-ui/core/CardMedia';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import WishDetail from './WishDetail';

const useStyles = makeStyles({
  root: {
    maxWidth: 345,
  },
  media: {
    height: 100,
    width: 100,
  },
});

const WishCard = (product) => {
  console.log('producto en wishcard', product.data.products);
  const dispatch = useDispatch();
  const [image, setImage] = useState([]);
  const { id, name, price, stock } = product.data.products;
  const classes = useStyles();

  const handleRemove = () => {};

  useEffect(() => {
    axios.get(`/dashboard/image/${id}`).then(res => {
      setImage(res.data[0].images)})
    // eslint-disable-next-line
  }, []);

  return (
    
    <div>
{product.data.products && product.data.products.map((element, index) => {
                      return (
                        <Box>
                          <WishDetail data={element} key={element.id} />
                        </Box>
                      );
                    })}
    </div>
  );
};
export default WishCard;
