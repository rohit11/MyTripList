//
//  RBaseViewController.swift
//  MyTripList
//
//  Created by Rohit Nisal on 9/24/16.
//  Copyright © 2016 Rohit Nisal. All rights reserved.
//

import UIKit

class RBaseViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        let backgroundImage = UIImageView(frame: UIScreen.mainScreen().bounds)
        backgroundImage.image = UIImage(named: "backgroundImage")
        self.view.insertSubview(backgroundImage, atIndex: 0)
        

    }
}
