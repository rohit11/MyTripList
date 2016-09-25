//
//  RCreateTripViewController.swift
//  MyTripList
//
//  Created by Rohit Nisal on 9/24/16.
//  Copyright © 2016 Rohit Nisal. All rights reserved.
//

import UIKit

class RCreateTripViewController: RBaseViewController {
    
    @IBAction func dismissController(){
        self.navigationController?.dismissViewControllerAnimated(true, completion: nil)
    }
}
