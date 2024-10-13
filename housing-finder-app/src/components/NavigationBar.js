// Navbar.js
import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

const NavigationBar = () => {
  return (
    <Navbar className="navBar">
        <Container>
          <Navbar.Brand className="navBrand" href="#home">Perspire</Navbar.Brand>
          <Nav className="navLink">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#features">Housing Finder</Nav.Link>
            <Nav.Link href="#pricing">About</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
  );
};

export default NavigationBar;